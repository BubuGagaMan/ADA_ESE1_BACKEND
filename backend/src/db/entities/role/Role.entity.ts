import { Entity, PrimaryGeneratedColumn, Column, Relation, ManyToMany, JoinTable } from 'typeorm'
import type { User } from '../user/User.entity.js'
import type { Permission } from '../permission/Permission.entity.js'

@Entity()
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ unique: true })
    name!: string

    @ManyToMany('Permission', 'roles', { cascade: true })
    @JoinTable({ name: 'role_permissions' }) // Creates the junction table
    permissions!: Relation<Permission>[]

    @ManyToMany('User', 'roles')
    users!: Relation<User>[]
}
