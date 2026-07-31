


MONOREPO/
│
├── apps/
|   |    
|   |
|   |___ web/  `as frontend`
|   |   |
|   |   ├__ src/
|   |       ├___ app/
|   |       |   │
|   │       |   ├── vehicles/
|   |       |   │
|   |       |   ├── login/
|   |       |
|   |       ├── component/
|   |       ├── hooks/
|   |       ├── providers/
|   |
|   ├── api/ `as backend`
|       |
|       ├── generated/
|       ├── prisma/
|       │   |
|       │   ├── schema.prisma
|       │   └── migrations/
|       |
|       ├__ src/
|           │
|           ├── server.ts
|           │
|           ├── config/
|           │   ├── env.ts
|           │   ├── prisma.ts
|           │   ├── jwt.ts
|           │   └── socket.ts
|           │
|           ├── modules/
|           │
|           │   ├── authentication/
|           │   │
|           │   │   ├── authentication.routes.ts
|           │   │   ├── authentication.controller.ts
|           │   │   ├── authentication.service.ts
|           │   │   ├── authentication.repository.ts
|           │   │   ├── authentication.schema.ts
|           │   │   ├── authentication.types.ts
|           │   │   └── authentication.mapper.ts
|           │   │
|           │   ├── users/
|           │   │
|           │   │   ├── user.routes.ts
|           │   │   ├── user.controller.ts
|           │   │   ├── user.service.ts
|           │   │   ├── user.repository.ts
|           │   │   ├── user.schema.ts
|           │   │   ├── user.types.ts
|           │   │   └── user.mapper.ts
|           │   │
|           │   ├── vehicles/
|           │   │
|           |   ├── utils/
|           │       ├── bcrypt.ts
|           │       ├── jwt.ts
|           │       ├── date.ts
|           │       ├── response.ts
|           │       └── generateDocumentNumber.ts
|           │
|           ├── middleware/
|           │   ├── authenticate.ts
|           │   ├── authorize.ts
|           │   ├── validation.ts
|           │   ├── errorHandler.ts
|           │   └── logger.ts
|           │
|           │
|           │
|           ├── socket/
|           │
|           ├── types/
|           │
|           └── generated/
|
|
│
├── packeges/
    │
    ├── shared/
        │
        ├── src/
        |   │
        |   ├── schemas/
        |   │
        |   ├── types/
        |   │
        |   ├── index.ts
        |
        ├── package.json