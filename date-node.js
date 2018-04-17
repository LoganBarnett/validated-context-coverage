// @flow

import type { Context, ValidationError, ValidateResult } from 'validated/schema'
import * as v from 'validated/schema'

class DateNode extends v.Node<Date> {
  validate (context: Context): ValidateResult<Date> {
    // Type refinement isn't working with just mixed. See:
    // https://github.com/facebook/flow/issues/2282
    return context.unwrap((value: mixed | Date) => {
      if (value instanceof Date) {
        return value
      } else if (typeof value === 'string') {
        const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
        if (dateMatch) {
          const [ , year, month, day ] = dateMatch
          // The actual calendar month used by Date is zero based (January is
          // 0), and the API is providing a human date, meaning no offset.
          const actualMonth = parseInt(month) - 1
          // Sometimes we get just a date and the intention with just-a-date is
          // that we just go by the calendar day and don't account for time zone
          // differences. We might need to make this deserializer configurable
          // if we decide this isn't behavior we want to support by default, but
          // that's for a later date (Get it? Date!).
          return new Date(parseInt(year), actualMonth, parseInt(day))
        } else {
          return new Date(value)
        }
      } else {
        throw context.error('This is not a Date: ' + JSON.stringify(value))
      }
    })
  }
}
