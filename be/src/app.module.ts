import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/user.entity';
import { userModule } from './user/user.module';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      driver: PostgreSqlDriver,
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      ensureDatabase: true,
      password: process.env.DB_PASSWORD || 'your_password_here',
      dbName: process.env.DB_NAME || 'task_management_db',            
      autoLoadEntities: true,
      entities: [User],
    }),
    userModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
