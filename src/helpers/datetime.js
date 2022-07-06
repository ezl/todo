import moment from 'moment'

export const isUtcDateInFuture = value => {
    const now =  moment.utc()
    const date = moment.utc(value)

    return now.isBefore(date)
}