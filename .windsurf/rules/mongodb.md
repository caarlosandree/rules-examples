---
trigger: model_decision
description: Regras e padrões para desenvolvimento com MongoDB. Use esta regra quando modelar documentos, criar schemas de validação, definir índices, escrever aggregation pipelines, usar transactions, configurar replicação/sharding, realizar backups ou aplicar segurança. Cobre modelagem de documentos, índices, aggregation, transactions, replicação/sharding, backups, segurança e anti-padrões.
globs: **/*.{js,ts,json}
---
# Regras de Desenvolvimento - MongoDB

## Stack Tecnológica

- **MongoDB 6.0+** como banco de dados orientado a documentos
- **MongoDB Atlas** ou cluster auto-gerenciado com replica set
- **Mongoose** (Node.js), **Spring Data MongoDB**, **PyMongo** ou driver oficial conforme a stack
- **MongoDB Compass** ou **mongosh** para administração e exploração
- **MongoDB Atlas Monitoring**, **Prometheus + mongodb_exporter** ou **Percona Monitoring and Management (PMM)** para observabilidade

## Princípios Gerais

- Modele os dados para os padrões de acesso da aplicação, não para normalização pura.
- Prefira embedded documents quando houver relação de pertencimento e leitura conjunta frequente.
- Use referências quando os dados são atualizados separadamente e compartilhados entre muitos documentos.
- Sempre defina schemas de validação em ambiente de produção.
- Crie índices de forma proposital; índices excessivos degradem writes.
- Use transações apenas quando necessário; documentos atômicos são preferidos.

## Nomenclatura

### Coleções e Campos

- Coleções: **snake_case**, plural (ex: `users`, `order_items`, `user_profiles`)
- Campos: **snake_case** ou **camelCase**, definido pelo time e mantido consistente (ex: `user_id`, `created_at`, `email_address`)
- Chaves primárias: `_id` (ObjectId por padrão)
- Chaves estrangeiras: `{referenced_collection}_id` (ex: `user_id`, `order_id`)
- Timestamps: `created_at`, `updated_at`, `deleted_at`
- Booleanos: prefixo `is_`, `has_`, `can_` (ex: `is_active`, `has_permission`)

### Índices

- Índices: `idx_{collection}_{fields}` (ex: `idx_users_email`, `idx_orders_user_id_created_at`)
- Índices únicos: `uk_{collection}_{fields}` (ex: `uk_users_email`)
- Índices compostos: campos ordenados da mais alta seletividade para a mais baixa

### Exemplos de Nomes

- ✅ Bom: `user_profiles`, `order_items`, `created_at`, `is_active`, `idx_orders_user_id_created_at`
- ❌ Ruim: `coll1`, `field1`, `flag`, `x`, `data`, `temp`, `idx_temp`

## Modelagem de Documentos

### Embedding vs Referência

- Embed quando:
  - Os dados são lidos juntos frequentemente.
  - O subdocumento não cresce sem limite.
  - Não há necessidade de acessar o subdocumento independentemente.
- Referencie quando:
  - Os dados são atualizados separadamente.
  - O mesmo dado é compartilhado entre muitos documentos.
  - O subdocumento cresceria muito (arrays descontrolados).

```javascript
// ✅ Bom: Embedding para endereço de usuário (dado de pertencimento)
db.users.insertOne({
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d0e1"),
    email: "joao@example.com",
    name: "João Silva",
    address: {
        street: "Rua das Flores",
        number: 123,
        city: "São Paulo",
        state: "SP",
        zip_code: "01001-000"
    },
    created_at: new Date()
});

// ✅ Bom: Referência para produtos em pedidos (dado compartilhado)
db.orders.insertOne({
    _id: ObjectId("75a1b2c3d4e5f6a7b8c9d0e2"),
    user_id: ObjectId("65a1b2c3d4e5f6a7b8c9d0e1"),
    items: [
        { product_id: ObjectId("85a1b2c3d4e5f6a7b8c9d0e3"), quantity: 2, unit_price: 49.90 },
        { product_id: ObjectId("95a1b2c3d4e5f6a7b8c9d0e4"), quantity: 1, unit_price: 129.90 }
    ],
    total_amount: 229.70,
    created_at: new Date()
});

// ❌ Ruim: Array sem limite crescendo indefinidamente
db.users.insertOne({
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d0e1"),
    email: "joao@example.com",
    orders: [
        // centenas de pedidos embutidos...
    ]
});
```

## Schemas de Validação

- Sempre use `validator` com `$jsonSchema` em produção.
- Defina tipos, campos obrigatórios e restrições.
- Valide timestamps, referências e enums.

```javascript
// ✅ Bom: Schema de validação
 db.createCollection("users", {
     validator: {
         $jsonSchema: {
             bsonType: "object",
             required: ["email", "name", "created_at"],
             properties: {
                 email: {
                     bsonType: "string",
                     pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
                 },
                 name: {
                     bsonType: "string",
                     minLength: 1,
                     maxLength: 100
                 },
                 age: {
                     bsonType: "int",
                     minimum: 0,
                     maximum: 150
                 },
                 status: {
                     enum: ["active", "inactive", "suspended"]
                 },
                 created_at: {
                     bsonType: "date"
                 }
             }
         }
     },
     validationLevel: "strict",
     validationAction: "error"
 });

// ❌ Ruim: Coleção sem validação
db.createCollection("users");
```

## Índices

- Crie índices em campos frequentemente consultados (`find`, `sort`, `aggregation`).
- Crie índices únicos para constraints de unicidade.
- Use índices compostos para queries com múltiplos campos.
- Use índices parciais (`partialFilterExpression`) quando apropriado.
- Monitore queries com `db.collection.explain("executionStats")`.

```javascript
// ✅ Bom: Índices adequados
db.users.createIndex({ email: 1 }, { name: "uk_users_email", unique: true });
db.orders.createIndex({ user_id: 1, created_at: -1 }, { name: "idx_orders_user_id_created_at" });
db.orders.createIndex(
    { status: 1, created_at: -1 },
    {
        name: "idx_orders_pending_created_at",
        partialFilterExpression: { status: "pending" }
    }
);

// ❌ Ruim: Índice desnecessário
db.users.createIndex({ name: 1 }, { name: "idx_users_name" }); // name nunca usado em query
```

### Explain

```javascript
// ✅ Bom: Analisar execução de query
db.orders.find({ user_id: ObjectId("65a1b2c3d4e5f6a7b8c9d0e1") })
    .sort({ created_at: -1 })
    .limit(20)
    .explain("executionStats");
```

## Aggregation Pipeline

- Use aggregation para transformações complexas, agrupamentos e lookups controlados.
- Use `$match` no início da pipeline para reduzir o dataset.
- Use `$project` para limitar campos retornados.
- Evite `$lookup` em pipelines de alta frequência quando possível.

```javascript
// ✅ Bom: Pipeline eficiente
db.orders.aggregate([
    { $match: { status: "completed", created_at: { $gte: new Date("2024-01-01") } } },
    { $group: {
        _id: "$user_id",
        total_orders: { $sum: 1 },
        total_spent: { $sum: "$total_amount" }
    }},
    { $sort: { total_spent: -1 } },
    { $limit: 10 },
    { $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
    }},
    { $unwind: "$user" },
    { $project: {
        user_name: "$user.name",
        user_email: "$user.email",
        total_orders: 1,
        total_spent: 1
    }}
]);

// ❌ Ruim: $match no meio da pipeline com lookup desnecessário
db.orders.aggregate([
    { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $match: { status: "completed" } }
]);
```

## Paginação

- Use `limit` e `skip` apenas para pequenos offsets.
- Para grandes datasets, use cursor-based pagination com `$gt` no `_id` ou campo indexado.

```javascript
// ✅ Bom: Paginação simples (pequenos offsets)
db.users.find({}, { email: 1, name: 1 })
    .sort({ created_at: -1 })
    .skip(0)
    .limit(20)
    .toArray();

// ✅ Bom: Cursor-based pagination (escalável)
db.users.find(
    { _id: { $gt: ObjectId("65a1b2c3d4e5f6a7b8c9d0e1") } },
    { email: 1, name: 1 }
)
    .sort({ _id: 1 })
    .limit(20)
    .toArray();
```

## Transactions

- Operações em um único documento são atômicas; prefira esse modelo.
- Use transações multi-documento apenas quando necessário.
- Mantenha transações curtas para evitar conflitos de write.

```javascript
// ✅ Bom: Transaction multi-documento
const session = db.getMongo().startSession();
session.startTransaction({
    readConcern: { level: "snapshot" },
    writeConcern: { w: "majority" }
});

try {
    const accounts = session.getDatabase("mydb").accounts;

    accounts.updateOne(
        { _id: ObjectId("65a1b2c3d4e5f6a7b8c9d0e1") },
        { $inc: { balance: -100 } }
    );

    accounts.updateOne(
        { _id: ObjectId("65a1b2c3d4e5f6a7b8c9d0e2") },
        { $inc: { balance: 100 } }
    );

    session.commitTransaction();
} catch (error) {
    session.abortTransaction();
    throw error;
} finally {
    session.endSession();
}
```

## Migrations

- Versione migrations com ferramenta da stack (ex: Mongock, migrate-mongo, Liquibase MongoDB ou script interno versionado).
- Migrations devem ser idempotentes: reexecutar não pode duplicar dados, recriar índices incompatíveis ou quebrar documentos já migrados.
- Para coleções grandes, faça backfill em lotes com filtro por `_id` ou campo indexado.
- Aplique mudanças incompatíveis em fases: adicionar campo/schema tolerante, escrever em formato novo, migrar dados, ler novo formato e só depois remover legado.
- Crie índices em background/rolling conforme versão e topologia; monitore impacto em primário e réplicas.
- Use `collMod` para endurecer validação apenas depois de medir documentos inválidos.
- Não rode migrations com usuário `root`; use papel específico de migration com ações necessárias.

```javascript
// ✅ Bom: migration idempotente com lote e filtro explícito
const batch = db.users
    .find({ email_normalized: { $exists: false } }, { _id: 1, email: 1 })
    .sort({ _id: 1 })
    .limit(500)
    .toArray();

for (const user of batch) {
    db.users.updateOne(
        { _id: user._id, email_normalized: { $exists: false } },
        { $set: { email_normalized: user.email.toLowerCase(), updated_at: new Date() } }
    );
}

// ✅ Bom: endurecer validação após backfill e medição
db.runCommand({
    collMod: "users",
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["email", "email_normalized", "created_at"]
        }
    },
    validationLevel: "strict",
    validationAction: "error"
});
```

## Replicação e Sharding

### Replicação

- Sempre use replica sets em produção (mínimo 3 nós).
- Use write concern `majority` para dados críticos.
- Use read preference `primary` para leituras consistentes; `secondary` para leituras escaláveis tolerantes a atraso.

```javascript
// ✅ Bom: Configuração de replica set
rs.initiate({
    _id: "rs0",
    members: [
        { _id: 0, host: "mongo1:27017" },
        { _id: 1, host: "mongo2:27017" },
        { _id: 2, host: "mongo3:27017" }
    ]
});
```

### Sharding

- Use sharding apenas quando o dataset exceder a capacidade de um único nó.
- Escolha uma shard key de alta cardinalidade e distribuição uniforme.
- Evite shard keys monotonicamente crescentes (ex: ObjectId por padrão).

```javascript
// ✅ Bom: Habilitar sharding
sh.enableSharding("mydb");
sh.shardCollection("mydb.orders", { user_id: 1, created_at: 1 });

// ❌ Ruim: Shard key monotonicamente crescente
sh.shardCollection("mydb.events", { _id: 1 });
```

## Backups

- Configure backups automáticos regulares.
- Use `mongodump` para backups lógicos.
- Use snapshots de filesystem ou **MongoDB Ops Manager** / **Atlas Backups** para backups físicos consistentes.
- Teste restauração regularmente.

```bash
# ✅ Bom: Backup lógico completo
mongodump --uri="$MONGODB_BACKUP_URI" --out=/backup/$(date +%Y%m%d)

# ✅ Bom: Backup de uma coleção específica
mongodump --uri="$MONGODB_BACKUP_URI" --collection=orders --out=/backup/$(date +%Y%m%d)

# ✅ Bom: Restaurar backup lógico
mongorestore --uri="$MONGODB_MIGRATOR_URI" /backup/20240101/mydb

# ✅ Bom: Backup com Atlas (exemplo conceitual)
# atlas backups snapshots create --clusterName myCluster --description "backup diario"
```

## Segurança

### Autenticação e Autorização

- Sempre habilite autenticação (`--auth`).
- Use SCRAM-SHA-256 para autenticação.
- Crie usuários com papéis mínimos necessários.
- Separe usuários de aplicação, leitura, migration e backup.
- Use `passwordPrompt()` no `mongosh` ou secret manager/IaC; nunca grave senha literal em script versionado.

```javascript
// ✅ Bom: Usuários e roles
use mydb;

db.createRole({
    role: "app_readwrite_limited",
    privileges: [
        {
            resource: { db: "mydb", collection: "users" },
            actions: ["find", "insert", "update"]
        },
        {
            resource: { db: "mydb", collection: "orders" },
            actions: ["find", "insert", "update"]
        }
    ],
    roles: []
});

db.createRole({
    role: "app_migrator_limited",
    privileges: [
        {
            resource: { db: "mydb", collection: "" },
            actions: ["find", "insert", "update", "remove", "createCollection", "createIndex", "collMod"]
        }
    ],
    roles: []
});

db.createUser({
    user: "app_user",
    pwd: passwordPrompt(),
    roles: [
        { role: "app_readwrite_limited", db: "mydb" }
    ]
});

db.createUser({
    user: "app_readonly",
    pwd: passwordPrompt(),
    roles: [
        { role: "read", db: "mydb" }
    ]
});

db.createUser({
    user: "migrator_user",
    pwd: passwordPrompt(),
    roles: [
        { role: "app_migrator_limited", db: "mydb" }
    ]
});

// ❌ Ruim: Usuário com permissões excessivas
use admin;
db.createUser({
    user: "app_user",
    pwd: passwordPrompt(),
    roles: [ { role: "root", db: "admin" } ]
});
```

### TLS

- Use TLS para conexões em produção.
- Valide certificados de clientes quando apropriado.

```bash
# ✅ Bom: Iniciar mongod com TLS
mongod --tlsMode requireTLS \
       --tlsCertificateKeyFile /etc/ssl/mongodb.pem \
       --tlsCAFile /etc/ssl/ca.pem \
       --bind_ip_all
```

### Dados Sensíveis

- Nunca armazene senhas em texto plano; armazene hash no aplicativo.
- Use criptografia no lado do cliente para dados sensíveis quando necessário.
- Habilite encryption at rest em produção (Atlas ou Enterprise).

## Anti-Padrões

### Documentos Gigantes

- Limite documentos a 16MB (limite do MongoDB).
- Evite arrays que crescem indefinidamente.

```javascript
// ❌ Ruim: Documento com array enorme
db.users.insertOne({
    email: "joao@example.com",
    activity_log: [
        // milhões de entradas...
    ]
});

// ✅ Bom: Mover para coleção separada
db.user_activities.insertOne({
    user_id: ObjectId("65a1b2c3d4e5f6a7b8c9d0e1"),
    action: "login",
    created_at: new Date()
});
```

### N+1 Queries

- Evite fazer uma query por documento relacionado.
- Use `$lookup` ou busque dados em lotes.

```javascript
// ❌ Ruim: N+1 queries
const orders = db.orders.find({ status: "pending" }).toArray();
orders.forEach(order => {
    const user = db.users.findOne({ _id: order.user_id }); // Uma query por pedido
    print(order._id, user.name);
});

// ✅ Bom: Busca em lote com $lookup
const result = db.orders.aggregate([
    { $match: { status: "pending" } },
    { $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user"
    }},
    { $unwind: "$user" },
    { $project: { order_id: "$_id", user_name: "$user.name" } }
]).toArray();
```

### Uso Indevido de `$where`

- Evite `$where` e `mapReduce` para lógica simples.
- Prefira aggregation pipeline.

```javascript
// ❌ Ruim: $where inseguro e lento
db.users.find({ $where: "this.age > 18" });

// ✅ Bom: Aggregation ou find comum
db.users.find({ age: { $gt: 18 } });
```

## Monitoramento

- Monitore queries lentas via profiler ou logs.
- Monitore índices não utilizados com `$indexStats`.
- Monitore operação de replica set e sharding.

```javascript
// ✅ Bom: Habilitar profiler para queries lentas
db.setProfilingLevel(1, { slowms: 100 });

// Ver queries lentas
db.system.profile.find().sort({ ts: -1 }).limit(10);

// Estatísticas de uso de índices
db.users.aggregate([ { $indexStats: {} } ]);
```

## Checklist Antes de Commitar

- [ ] Schema de validação definido para novas coleções
- [ ] Índices criados para campos de consulta frequente
- [ ] Modelagem balanceada entre embedding e referência
- [ ] Queries otimizadas com explain
- [ ] Sem arrays descontrolados ou documentos gigantes
- [ ] Transações usadas apenas quando necessário
- [ ] Autenticação e autorização configuradas
- [ ] Usuários separados para app, leitura, migration e backup
- [ ] Migrations idempotentes, em lotes e sem usuário `root`
- [ ] TLS habilitado em produção
- [ ] Backup configurado e testado
- [ ] Anti-padrões N+1 e $where evitados
