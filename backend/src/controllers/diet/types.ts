import { WEIGHT_GOAL } from '@db/entities/diet/Diet.entity.js'
import { UserMetricsFormRequest } from '@services/types/servicePayloadTypes/diet.service.payload.type.js'

export interface UpdateDietById {
    Params: { dietId: string }
    Body: { weightGoal: WEIGHT_GOAL; name: string; userMetrics: UserMetricsFormRequest }
}

export interface CreateDiet {
    Body: { weightGoal: WEIGHT_GOAL; name: string }
}

export interface GetOneDietById {
    Params: {
        dietId: string
    }
}
