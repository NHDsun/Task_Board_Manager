import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/decorators/legacy';
import { v4 } from 'uuid';
import { GlobalRole, Department } from './user.enums'; // Gọi lại file enum riêng

@Entity()
export class User {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ unique: true })
  email!: string;

  @Property()
  passwordHash!: string;

  @Property()
  fullName!: string;

  @Enum(() => GlobalRole)
  globalRole: GlobalRole = GlobalRole.Employee;

  @Enum({ items: () => Department, nullable: true })
  department?: Department;

  @Property()
  isActive: boolean = true;

  @Property()
  createdAt: Date = new Date();
}