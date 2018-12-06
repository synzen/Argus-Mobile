const ImageSchema = {
  name: 'Image',
  properties: {
    path: 'string',
    url: 'string?', // hosted on the server, if available
    width: 'int',
    height: 'int',
    sizeMB: 'string'
  }
}

const ClassificationSchema = {
  name: 'Classification',
  properties: {
    description: 'string',
    score: 'float',
    wikipediaUrl: 'string?',
    summary: 'string?'
  }
}

const ClassifiedResultSchema = {
  name: 'ClassifiedResult',
  primaryKey: 'id',
  properties: {
    id: 'string',
    image: 'Image',
    successful: 'bool',
    response: 'string',
    error: 'string?',
    date: {
      type: 'date',
      default: new Date()
    },
    classifications: 'Classification[]'
  }
}

export default {
  ClassifiedResultSchema,
  ClassificationSchema,
  ImageSchema,
  all: [ ClassifiedResultSchema, ClassificationSchema, ImageSchema ]
}
