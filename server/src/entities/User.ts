import { Field, ObjectType, Int} from "type-graphql";
import {Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, UpdateDateColumn, BaseEntity} from "typeorm"

@ObjectType()
@Entity()
export class User extends BaseEntity{

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = Date;
  @Field()
  @Column({unique: true})
  username!: string;

  @Field()
  @Column({unique: true})
  email!: string;

  @Column()
  password!: string;

}