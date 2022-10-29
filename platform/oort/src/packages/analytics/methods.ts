export const submitMetrics = {
  name: 'kb_submitMetrics',
  params: [
    {
      name: 'metric',
      summary: 'Metric name',
      required: true,
      schema: {
        type: 'string',
      },
    },
    {
      name: 'value',
      summary: 'Metric value',
      required: false,
      deafault: 1,
      schema: {
        type: 'number',
      },
    },
    {
      name: 'tags',
      summary: 'Metric tags',
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    {
      name: 'type',
      summary: 'Metric type',
      required: false,
      schema: {
        type: 'string',
      },
    },
  ],
  result: {
    name: 'metrics_result',
    schema: {
      type: 'null',
    },
  },
}

// https://docs.datadoghq.com/api/latest/events/#post-an-event
export const submitEvent = {
  name: 'kb_submitEvent',
  params: [
    {
      name: 'title',
      summary: 'Event Title',
      required: true,
      schema: {
        type: 'string',
      },
    },
    {
      name: 'text',
      summary: 'Event text',
      required: false,
      schema: {
        type: 'string',
      },
    },
    {
      name: 'tags',
      summary: 'Event tags',
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    {
      name: 'aggregation_key',
      summary: 'Event aggregation key',
      required: false,
      schema: {
        type: 'string',
      },
    },
  ],
  result: {
    name: 'event_result',
    schema: {
      type: 'null',
    },
  },
}
