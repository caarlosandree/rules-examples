---
trigger: model_decision
description: Regras fundamentais de segurança aplicáveis a qualquer stack — validação de entrada, sanitização, autenticação/autorização, CSRF, rate limiting, hashing de senhas, webhooks, SSRF, command injection, erros seguros, secrets, PII, logs, CORS, HTTPS, dependências vulneráveis e OWASP Top 10 básico.
globs: **/*
---

# Segurança em Qualquer Stack — Regras Fundamentais

Estas regras são transversais a backend, frontend, mobile, infraestrutura e APIs. Siga-as em todo código que processa dados, acessa recursos, expõe interfaces ou manipula secrets.

---

## 1. Validação de Dados de Entrada

Valide **toda** entrada originada fora da aplicação: formulários, query params, headers, corpos de requisição, arquivos, mensagens de fila, variáveis de ambiente lidas de fontes externas e respostas de serviços terceiros.

- Rejeite dados inválidos o mais cedo possível (fail-fast).
- Valide tipo, tamanho, formato, faixa de valores e lista de valores permitidos (allow-list).
- Nunca confie apenas em validação do cliente.
- Use DTOs, records, structs ou schemas separados dos modelos de banco/ORM.

### Backend — Java / Spring Boot

```java
// ✅ Bom: DTO com Bean Validation e allow-list de valores
public record CriarUsuarioRequest(
    @NotBlank @Size(max = 120) String nome,
    @NotBlank @Email String email,
    @NotNull @Pattern(regexp = "^(USER|ADMIN)$") String perfil,
    @NotNull @Positive Integer idade
) {}

@PostMapping("/usuarios")
public ResponseEntity<UsuarioDTO> criar(@RequestBody @Valid CriarUsuarioRequest request) { ... }

// ❌ Ruim: entidade JPA exposta no controller — permite Mass Assignment
@PostMapping("/usuarios")
public ResponseEntity<Usuario> criar(@RequestBody Usuario usuario) { ... }
```

### Backend — Node.js / NestJS

```typescript
// ✅ Bom: DTO com class-validator
export class CriarUsuarioDto {
  @IsString() @Length(1, 120) nome: string;
  @IsEmail() email: string;
  @IsIn(['USER', 'ADMIN']) perfil: string;
  @IsInt() @Min(1) idade: number;
}

@Post('usuarios')
async criar(@Body() dto: CriarUsuarioDto) { ... }

// ❌ Ruim: tipo any aceita qualquer payload
@Post('usuarios')
async criar(@Body() body: any) { ... }
```

### Frontend — TypeScript / React

```typescript
// ✅ Bom: Zod define contrato e tipagem ao mesmo tempo
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(12, 'Mínimo 12 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

// ❌ Ruim: validação fraca baseada em regex apenas
const emailRegex = /^[^\s@]+@[^\s@]+$/
```

---

## 2. Sanitização, Parametrização e Codificação Contextual

- Para HTML rico, sanitize com biblioteca consolidada; não reinvente sanitizadores com regex.
- Para SQL/NoSQL/LDAP, use APIs parametrizadas, query builders seguros ou escaping contextual oficial da biblioteca.
- Para comandos de shell, evite shell livre; quando inevitável, use lista de argumentos, allow-list e APIs que não interpretem metacaracteres.
- Para paths de arquivo, normalize o caminho e valide que permanece dentro do diretório permitido.
- Escape output de acordo com o contexto (HTML, atributo, URL, CSS, JavaScript, logs).

### Proteção contra XSS

```typescript
// ✅ Seguro: React/Vue/Angular escapa JSX por padrão
function Saudacao({ nome }: { nome: string }) {
  return <h1>Olá, {nome}</h1>
}

// ✅ HTML rico somente após sanitização
import DOMPurify from 'dompurify'
const safeHtml = DOMPurify.sanitize(htmlDoUsuario, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
  ALLOWED_ATTR: [],
})
;<div dangerouslySetInnerHTML={{ __html: safeHtml }} />

// ❌ Perigoso: injeção direta de HTML
<div dangerouslySetInnerHTML={{ __html: htmlDoUsuario }} />
```

### Proteção contra SQL Injection

```java
// ✅ Query parametrizada
@Query("SELECT u FROM Usuario u WHERE u.email = :email AND u.ativo = true")
Optional<Usuario> findAtivoByEmail(@Param("email") String email);

// ❌ Nunca concatene strings em SQL
String sql = "SELECT * FROM usuarios WHERE email = '" + email + "'";
```

```typescript
// ✅ Node.js com pg — placeholders numerados
const result = await pool.query(
  'SELECT * FROM usuarios WHERE email = $1 AND ativo = true',
  [email]
)

// ❌ Template string com interpolação
const result = await pool.query(`SELECT * FROM usuarios WHERE email = '${email}'`)
```

---

## 3. Autenticação e Autorização

- Autenticação = provar quem é. Autorização = o que pode fazer. Ambas devem ser implementadas no servidor.
- Negue por padrão (deny-by-default). Habilite permissões explicitamente.
- Valide tokens/sessões em toda requisição protegida.
- Proteja rotas no cliente apenas como UX; a decisão final é sempre do backend.

### Tokens JWT

```java
// ✅ Validação completa: assinatura, exp, iss, aud e blacklist
Claims claims = Jwts.parserBuilder()
    .setSigningKey(secretKey)
    .requireIssuer("minha-app")
    .requireAudience("minha-app-api")
    .build()
    .parseClaimsJws(token)
    .getBody();

if (tokenBlacklist.isBlacklisted(token)) {
    throw new JwtException("Token revogado");
}
```

### Cookies httpOnly e SameSite

```http
// ✅ Header de Set-Cookie seguro
Set-Cookie: session=<valor-opaco-gerado-no-servidor>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600

// ❌ Cookie exposto a JavaScript e enviado por requisições cross-site
Set-Cookie: session=<valor-opaco-gerado-no-servidor>; Path=/
```

### Controle de Acesso a Nível de Objeto (BOLA/IDOR)

```java
// ✅ Sempre valide posse do recurso
public DocumentoDTO buscar(Long id) {
    Long tenantId = tenantContext.getTenantId();
    Documento doc = documentoRepository.findByIdAndTenantId(id, tenantId)
        .orElseThrow(() -> new EntityNotFoundException("Não encontrado"));
    return mapper.toDTO(doc);
}

// ❌ Nunca confie em ID vindo do cliente sem validar posse
Documento doc = documentoRepository.findById(id).orElseThrow(...);
```

---

## 4. CSRF e Requisições Autenticadas por Cookie

- Proteja endpoints mutáveis (`POST`, `PUT`, `PATCH`, `DELETE`) quando a autenticação usa cookies, sessão de navegador ou qualquer credencial enviada automaticamente.
- Use token CSRF imprevisível, vinculado à sessão, enviado em header customizado e validado no servidor.
- Combine `SameSite=Lax` ou `SameSite=Strict` com validação de `Origin`/`Referer` em operações sensíveis.
- Não trate CORS como defesa contra CSRF; CORS controla leitura de resposta, não impede envio de requisição.
- APIs exclusivamente bearer-token em header `Authorization` normalmente têm risco menor de CSRF, mas ainda precisam de validação de origem quando expõem fluxos sensíveis via navegador.

```typescript
// ✅ Bom: valida Origin e token CSRF em mutações autenticadas por cookie
function csrfProtection(req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = new Set(['https://app.exemplo.com'])
  const origin = req.header('origin')
  const csrfHeader = req.header('x-csrf-token')
  const csrfSession = req.session?.csrfToken

  if (!origin || !allowedOrigins.has(origin) || !csrfHeader || csrfHeader !== csrfSession) {
    return res.status(403).json({ error: 'Requisição não autorizada' })
  }

  next()
}

// ❌ Ruim: confiar apenas em cookie de sessão para mutação crítica
app.post('/api/pagamentos', sessionMiddleware, criarPagamento)
```

---

## 5. Rate Limiting e Proteção contra Abuso

- Defina limites por IP, usuário, tenant, token e tipo de operação.
- Use limites mais restritivos para login, reset de senha, OTP, envio de email/SMS, upload, exportação e endpoints caros.
- Em ambientes distribuídos, use store centralizado (Redis, gateway, WAF ou API Gateway), não memória local do processo.
- Retorne `429 Too Many Requests` com `Retry-After`; não revele se email/usuário existe em fluxos de autenticação.
- Registre eventos de abuso com correlation ID sem logar payload sensível.

```typescript
// ✅ Bom: limites separados por criticidade
app.use('/api/auth/login', strictAuthRateLimit)
app.use('/api/password/reset', strictAuthRateLimit)
app.use('/api/reports/export', expensiveOperationRateLimit)
app.use('/api', defaultApiRateLimit)

// ❌ Ruim: nenhum limite em login ou reset de senha
app.post('/api/auth/login', loginController)
```

---

## 6. Hashing de Senhas

- Nunca armazene senha em texto puro, criptografada de forma reversível ou com hash rápido (`MD5`, `SHA-1`, `SHA-256` puro).
- Use Argon2id, bcrypt ou scrypt com parâmetros revisados pelo time conforme custo aceitável de CPU/memória.
- Gere salt único por senha; não reutilize salt global.
- Use pepper apenas como secret adicional armazenado fora do banco (secret manager/env runtime); planeje rotação.
- A mensagem de erro de login deve ser genérica para usuário inexistente e senha inválida.

```typescript
// ✅ Bom: Argon2id com pepper fora do banco
import argon2 from 'argon2'

const pepper = process.env.PASSWORD_PEPPER
if (!pepper) throw new Error('PASSWORD_PEPPER ausente')

const passwordHash = await argon2.hash(`${senha}${pepper}`, {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
})

const senhaValida = await argon2.verify(passwordHashSalvo, `${senhaInformada}${pepper}`)

// ❌ Ruim: hash rápido e sem salt adequado
const passwordHash = sha256(senha)
```

---

## 7. Gerenciamento de Secrets

- Nunca committe senhas, tokens, chaves privadas, connection strings ou credenciais de API no código.
- Use variáveis de ambiente, secret managers (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault, Doppler) ou arquivos montados em runtime.
- Gire secrets periodicamente e após incidentes.
- Diferencie secrets de build de secrets de runtime.
- Em exemplos, use placeholders não executáveis como `<DATABASE_URL>`; nunca use senha, token ou host real.
- Se um secret foi commitado, trate como comprometido: remova do histórico quando apropriado e rotacione no provedor.

```bash
# ✅ Variável de ambiente
export JWT_SECRET=$(openssl rand -base64 32)

# ✅ Exemplo documentacional sem segredo copiável
DATABASE_URL=<postgresql-url-vinda-do-secret-manager>

# ❌ Arquivo .env commitado com segredo real
JWT_SECRET=<valor-real-commitado>
DATABASE_URL=<connection-string-real-commitada>
```

```typescript
// ✅ Validação de secrets obrigatórios na inicialização
const required = ['JWT_SECRET', 'DATABASE_URL', 'ENCRYPTION_KEY']
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${key}`)
  }
}
```

---

## 8. Proteção de Dados Pessoais (PII)

- Colete apenas o mínimo necessário (data minimization).
- Não logue PII completo (CPF, RG, email, telefone, endereço, número de cartão, dados de saúde).
- Mascare PII em logs e interfaces quando o valor completo não for necessário.
- Criptografe PII sensível em repouso (AES-256-GCM) e em trânsito (TLS 1.2+).
- Respeite LGPD/GDPR: consentimento, direito de acesso, retificação e exclusão.

```java
// ✅ Máscara em logs
String cpfMascarado = "***.***.***-" + cpf.substring(cpf.length() - 2);
log.info("Consulta CPF {} realizada", cpfMascarado);

// ❌ Log expõe PII completo
log.info("Consulta CPF {} realizada", cpf);
```

```typescript
// ✅ Exposição mínima na UI
const emailMascarado = email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
// joao@email.com → jo***@email.com
```

---

## 9. Logs de Segurança

- Registre eventos de segurança: login/logout, falhas de autenticação, alterações de permissão, acesso a dados sensíveis, mudanças críticas de estado, tentativas de IDOR.
- Nunca logue secrets, tokens, senhas ou PII completo.
- Use formato estruturado (JSON) e inclua correlation ID, timestamp UTC, userId, tenantId e IP.
- Proteja contra log injection: remova ou escape `\n`, `\r` e caracteres de controle de entradas antes de logar.

```java
// ✅ Log estruturado e seguro
log.warn("Falha de autenticação", kv("email", emailMascarado), kv("ip", ip), kv("tenantId", tenantId));

// ❌ Log injection permitido
log.warn("Falha de login do usuario: " + inputDoUsuario);
```

---

## 10. Erros Seguros e Respostas de API

- Em produção, nunca retorne stack trace, query SQL, nome de tabela, caminho local, variável de ambiente, token ou detalhe interno.
- Use mensagens genéricas para erro inesperado e mensagens específicas apenas para validação controlada.
- Mapeie erros esperados para status corretos (`400`, `401`, `403`, `404`, `409`, `422`, `429`) sem vazar existência de recurso quando isso facilitar enumeração.
- Logue o detalhe técnico no servidor com correlation ID; retorne o correlation ID para suporte.
- Padronize o envelope de erro para evitar respostas inconsistentes entre endpoints.

```typescript
// ✅ Bom: resposta segura com correlation ID
try {
  await criarUsuario(dto)
} catch (error) {
  const correlationId = req.id
  logger.error({ correlationId, error }, 'Falha ao criar usuário')
  return res.status(500).json({
    error: 'Erro interno',
    correlationId,
  })
}

// ❌ Ruim: expõe detalhe interno
return res.status(500).json({ error: error.stack })
```

---

## 11. CORS e Headers de Segurança

- Configure CORS de forma restritiva, com origens explicitamente permitidas.
- Nunca use `*` combinado com `credentials: true`.
- Em produção: HTTPS obrigatório, HSTS, CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy.

```java
// ✅ CORS explícito e restritivo
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                .allowedHeaders("Authorization", "Content-Type")
                .allowCredentials(true);
    }
}
```

```typescript
// ✅ Headers de segurança no Next.js
// next.config.js
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
]
```

---

## 12. HTTPS e Transporte Seguro

- Use TLS 1.2 ou superior em todos os ambientes que não sejam localhost.
- Redirecione HTTP para HTTPS.
- Valide certificados em serviços internos; não desative verificação em produção.
- Não envie tokens ou PII por URL (query params) — use headers ou corpo criptografado.

```bash
# ✅ curl validando certificado
curl https://api.exemplo.com/health

# ❌ Desabilita validação de certificado
curl -k https://api.exemplo.com/health
```

---

## 13. SSRF, Webhooks e Integrações Externas

### SSRF

- Nunca faça requisições server-side para URL arbitrária enviada pelo cliente.
- Use allow-list de hosts/serviços, bloqueie IPs privados/link-local/loopback e normalize a URL antes da validação.
- Revalide o destino após redirects; quando possível, desabilite redirects automáticos.
- Aplique timeout curto, limite de tamanho de resposta e bloqueio de protocolos não HTTP(S).

```typescript
// ✅ Bom: resolve destino por chave de serviço permitida, não por URL livre
const allowedWebhookTargets = {
  billing: 'https://billing.exemplo.com/webhooks/status',
  crm: 'https://crm.exemplo.com/webhooks/status',
} as const

const targetUrl = allowedWebhookTargets[dto.target]
if (!targetUrl) throw new Error('Destino não permitido')

// ❌ Ruim: URL controlada pelo usuário vira requisição server-side
await fetch(req.body.url)
```

### Webhooks

- Verifique assinatura HMAC/assimétrica usando o corpo bruto recebido, antes de parsear ou processar evento.
- Valide timestamp e rejeite replay fora de uma janela curta.
- Garanta idempotência por `event_id` ou chave equivalente.
- Responda rápido e processe trabalho pesado de forma assíncrona.
- Não confie em `event_type`, `amount`, `status` ou IDs do webhook sem reconciliar com a API/provedor quando o impacto financeiro ou permissivo for alto.

```typescript
// ✅ Bom: assinatura sobre body bruto e comparação em tempo constante
const assinaturaValida = verifyWebhookSignature({
  rawBody: req.rawBody,
  signature: req.header('x-provider-signature'),
  timestamp: req.header('x-provider-timestamp'),
  secret: process.env.WEBHOOK_SECRET,
})

if (!assinaturaValida) {
  return res.status(401).json({ error: 'Assinatura inválida' })
}
```

---

## 14. Command Injection e Execução de Processos

- Evite shell quando uma API/biblioteca resolve o problema.
- Se precisar executar processo, use lista de argumentos (`execFile`, `spawn` sem `shell: true`) e allow-list de comandos/opções.
- Nunca concatene entrada do usuário em comando, path, flag ou script.
- Defina timeout, diretório de trabalho restrito, usuário sem privilégios e limite de saída.
- Trate paths com normalização e validação contra diretório base.

```typescript
// ✅ Bom: comando fixo e argumento separado
import { execFile } from 'node:child_process'

execFile('git', ['log', '--oneline', '--', caminhoValidado], { timeout: 5000 }, callback)

// ❌ Ruim: entrada do usuário interpolada no shell
exec(`git log --oneline ${req.query.path}`, callback)
```

---

## 15. Dependências Vulneráveis

- Mantenha dependências atualizadas.
- Execute scans de vulnerabilidades no CI: `npm audit`, `pnpm audit`, `OWASP Dependency-Check`, `Snyk`, `Trivy`.
- Bloqueie merges com dependências críticas não corrigidas.
- Use lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `Gemfile.lock`) e verifique integridade.

```bash
# ✅ Scan de dependências
pnpm audit --audit-level moderate
./gradlew dependencyCheckAnalyze
trivy fs .

# ✅ Atualização segura
pnpm update --interactive
```

---

## 16. Upload de Arquivos e Paths

- Valide tipo MIME real, extensão e tamanho máximo.
- Armazene arquivos fora do diretório público; sirva via controller com autorização.
- Proteja contra path traversal e zip bombs.

```java
// ✅ Validação de upload
if (!file.getContentType().equals("application/pdf") || file.getSize() > 5 * 1024 * 1024) {
    throw new SecurityException("Arquivo inválido");
}

// ✅ Proteção contra path traversal
Path basePath = Paths.get(storageRoot).toRealPath();
Path target = basePath.resolve(fileName).normalize();
if (!target.startsWith(basePath)) {
    throw new SecurityException("Acesso negado");
}
```

---

## 17. OWASP Top 10 — Defesa Rápida

| Risco | Defesa Principal |
|-------|------------------|
| A01: Broken Access Control | Autorização explícita em cada recurso; deny-by-default; 404 para recursos não autorizados |
| A02: Cryptographic Failures | TLS 1.2+, bcrypt/Argon2 para senhas, AES-256-GCM para dados sensíveis, secrets em vault |
| A03: Injection | Prepared statements, ORM parametrizado, sanitização de HTML, escape de logs |
| A04: Insecure Design | Threat modeling, princípio do menor privilégio, rate limiting, audit logs |
| A05: Security Misconfiguration | CORS restritivo, headers de segurança, configs de produção revisadas, versões mínimas |
| A06: Vulnerable Components | Scans contínuos, lockfiles, atualizações planejadas |
| A07: ID and Auth Failures | JWT com expiração curta, validação iss/aud, httpOnly cookies, MFA quando possível |
| A08: Software and Data Integrity | Assinatura de webhooks, checksums, fontes confiáveis de dependências |
| A09: Logging Failures | Logs estruturados sem PII, monitoramento, alertas de anomalias |
| A10: SSRF | Validação e allow-list de URLs; não siga redirecionamentos sem controle |

---

## 18. Checklist Rápido Antes de Commit

- [ ] Nenhuma credencial, chave ou token foi adicionada ao código.
- [ ] Todas as entradas de usuário são validadas e, quando necessário, sanitizadas.
- [ ] Consultas a banco usam parametrização.
- [ ] Acesso a recursos por ID valida posse/tenant.
- [ ] Endpoints mutáveis autenticados por cookie têm proteção CSRF.
- [ ] Login, reset de senha, webhooks, upload e operações caras têm rate limiting.
- [ ] Senhas usam Argon2id/bcrypt/scrypt; nunca hash rápido ou criptografia reversível.
- [ ] Webhooks validam assinatura, timestamp e idempotência.
- [ ] Requisições server-side para terceiros usam allow-list e proteção contra SSRF.
- [ ] Execução de comandos não usa shell com entrada do usuário.
- [ ] Erros de produção não vazam stack trace, query, path, secrets ou PII.
- [ ] Não há PII completo em logs ou respostas desnecessárias.
- [ ] CORS e headers de segurança estão configurados.
- [ ] Tokens têm expiração curta e validação completa.
- [ ] Dependências conhecidas vulneráveis foram verificadas.

---

## Módulos Relacionados

- `security-analysis.md`: Análise de segurança profunda (SAST, Threat Hunting) quando solicitar "Análise de Segurança".
