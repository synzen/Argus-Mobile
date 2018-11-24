const ImageSchema = {
  name: 'Image',
  properties: {
    path: 'string',
    width: 'int',
    height: 'int',
    sizeMB: 'string'
  }
}

const IdentifiedItemSchema = {
  name: 'IdentifiedItem',
  primaryKey: 'id',
  properties: {
    id: 'string',
    image: 'Image',
    response: 'string',
    date: {
      type: 'date',
      default: new Date()
    },
    classifications: 'Classification[]'
  }
}

const FailedIdentifiedItemSchema = {
  name: 'FailedIdentifiedItem',
  primaryKey: 'id',
  properties: {
    id: 'string',
    image: 'Image',
    error: 'string',
    date: {
      type: 'date',
      default: new Date()
    }
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

export default {
  IdentifiedItemSchema,
  FailedIdentifiedItemSchema,
  ClassificationSchema,
  ImageSchema,
  all: [ IdentifiedItemSchema, FailedIdentifiedItemSchema, ClassificationSchema, ImageSchema ]
}
