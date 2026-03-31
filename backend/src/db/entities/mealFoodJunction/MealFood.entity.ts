import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm'
import { Meal } from '../meal/Meal.entity.js'
import { Food } from '../food/Food.entity.js'

@Entity()
export class MealFood {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    // weight in GRAMS * 10 - TO AVOID FRACTIONS!!!
    @Column()
    weight!: number

    @ManyToOne('Meal', 'mealFoods', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'meal_id' })
    meal!: Relation<Meal>

    @ManyToOne('Food', 'mealFoods')
    @JoinColumn({ name: 'food_id' })
    food!: Relation<Food>
}
