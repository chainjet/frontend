export const jsonSchemaDefinitions = {
  chainjet_day_of_week: {
    title: 'Day of the week',
    type: 'integer',
    default: 1,
    oneOf: [
      { title: 'Monday', const: 1 },
      { title: 'Tuesday', const: 2 },
      { title: 'Wednesday', const: 3 },
      { title: 'Thursday', const: 4 },
      { title: 'Friday', const: 5 },
      { title: 'Saturday', const: 6 },
      { title: 'Sunday', const: 0 },
    ],
  },

  chainjet_poll_interval: {
    default: 300,
    title: 'Polling interval',
    description: 'How often ChainJet checks the trigger condition.',
    type: 'integer',
    oneOf: [
      { title: '1 minute', const: 60 },
      { title: '5 minutes', const: 300 },
      { title: '10 minutes', const: 600 },
      { title: '15 minutes', const: 900 },
      { title: '30 minutes', const: 1800 },
      { title: '1 hour', const: 3600 },
      { title: '6 hours', const: 21600 },
      { title: '12 hours', const: 43200 },
      { title: '1 day', const: 86400 },
      { title: '1 week', const: 604800 },
    ],
  },

  chainjet_schedule: {
    type: 'object',
    title: '',
    required: ['frequency'],
    properties: {
      frequency: {
        type: 'string',
        title: 'Run Workflow',
        default: 'interval',
        oneOf: [
          { title: 'Once', const: 'once' },
          { title: 'At regular intervals', const: 'interval' },
          { title: 'Every hour', const: 'hour' },
          { title: 'Every day', const: 'day' },
          { title: 'Every week', const: 'week' },
          { title: 'Every month', const: 'month' },
          { title: 'On cron expression', const: 'cron' },
        ],
      },
    },
    dependencies: {
      frequency: {
        type: 'object',
        oneOf: [
          {
            required: ['datetime'],
            properties: {
              frequency: {
                const: 'once',
              },
              datetime: {
                title: 'Date and time',
                type: 'string',
                format: 'date-time',
              },
            },
          },
          {
            required: ['interval'],
            properties: {
              frequency: {
                const: 'interval',
              },
              interval: {
                title: 'Interval',
                type: 'integer',
                oneOf: [
                  { title: '1 minute', const: 60 },
                  { title: '5 minutes', const: 300 },
                  { title: '10 minutes', const: 600 },
                  { title: '15 minutes', const: 900 },
                  { title: '30 minutes', const: 1800 },
                  { title: '1 hour', const: 3600 },
                  { title: '6 hours', const: 21600 },
                  { title: '12 hours', const: 43200 },
                  { title: '1 day', const: 86400 },
                  { title: '1 week', const: 604800 },
                ],
              },
            },
          },
          {
            required: ['minute'],
            properties: {
              frequency: {
                const: 'hour',
              },
              minute: {
                title: 'Minute',
                type: 'integer',
                deault: 0,
                minimum: 0,
                maximum: 59,
              },
            },
          },
          {
            required: ['time'],
            properties: {
              frequency: {
                const: 'day',
              },
              time: {
                title: 'Time',
                type: 'string',
                default: '00:00',
              },
            },
          },
          {
            required: ['dayOfWeek', 'time'],
            properties: {
              frequency: {
                const: 'week',
              },
              dayOfWeek: {
                $ref: '#/definitions/chainjet_day_of_week',
              },
              time: {
                title: 'Time',
                type: 'string',
                default: '00:00',
              },
            },
          },
          {
            required: ['dayOfMonth', 'time'],
            properties: {
              frequency: {
                const: 'month',
              },
              dayOfMonth: {
                type: 'integer',
                title: 'Day of the month',
                default: 1,
                minimum: 1,
                maximum: 31,
              },
              time: {
                title: 'Time',
                type: 'string',
                default: '00:00',
              },
            },
          },
          {
            required: ['expression'],
            properties: {
              frequency: {
                const: 'cron',
              },
              expression: {
                type: 'string',
                title: 'Cron expression',
                default: '0 0 * * *',
                description: 'Minute / Hour / Day of month / Month / Day of week',
              },
            },
          },
        ],
      },
    },
  },
}
