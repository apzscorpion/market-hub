export interface ClassificationOption {
  id: string
  name: string
  nameML: string
}

export interface ClassificationConfig {
  types: ClassificationOption[]
  flavors: ClassificationOption[]
  variants: ClassificationOption[]
  packagingTypes: ClassificationOption[]
  temperatureLevels: ClassificationOption[]
}
