import { Column, Entity, PrimaryGeneratedColumn, OneToOne, Relation, OneToMany, ManyToMany, JoinTable } from 'typeorm'

import { Role } from '../role/Role.entity.js'
import { UserMetrics } from '../user_metrics/UserMetrics.entity.js'
import type { Diet } from '../diet/Diet.entity.js'

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({
        unique: true,
    })
    username!: string

    @Column({
        unique: true,
    })
    email!: string

    @Column()
    password!: string

    @Column({ nullable: true })
    profile_image_url!: string

    @ManyToMany('Role', 'users')
    @JoinTable({ name: 'user_roles' })
    roles!: Relation<Role>[]

    @Column({ default: false })
    suspended!: boolean

    @OneToOne('UserMetrics', 'user', {
        cascade: ['insert', 'update'],
        nullable: true,
    })
    userMetrics!: Relation<UserMetrics> | null

    @OneToMany('Diet', 'user', {
        cascade: ['insert', 'update'],
    })
    diet!: Relation<Diet[]>
}
