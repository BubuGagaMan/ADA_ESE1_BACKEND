import { Column, Entity, ManyToMany, PrimaryGeneratedColumn, Relation } from 'typeorm'
import { Role } from '../role/Role.entity.js'

@Entity()
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ unique: true })
    name!: string // format names as: "CREATE_DIET", "EDIT_OWN_GOAL"

    @ManyToMany('Role', 'permissions')
    roles!: Relation<Role>[]
}
