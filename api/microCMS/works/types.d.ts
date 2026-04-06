import type { MicroCMSDate, MicroCMSImage } from 'microcms-js-sdk'

export type WorksContent = {
  id: string;
  title: string;
  eyecatch?: MicroCMSImage;
  category?:  WorkCategoryContent[];
  tag?: WorkTagContent[];
  skill?: WorkSkillContent[];
  periodStart: Date;
  periodEnd?: Date;
  siteUrl?: string;
  pcImg?: MicroCMSImage;
  spImg?: MicroCMSImage;
  content?: string;
} & MicroCMSDate

export type WorkCategoryContent = {
  id: string
  label: string
  value: string
} & MicroCMSDate

export type WorkTagContent = {
  id: string
  tag: string
  value: string
} & MicroCMSDate

export type WorkSkillContent = {
  id: string
  skill: string
  value: string
} & MicroCMSDate

export type CategoryWithCount = {
  id: string
  label: string
  value: string
  totalCount: number
} & MicroCMSDate

export type WorksArchive = {
  works: {
    eyecatch?: MicroCMSImage
    category?:  WorkCategoryContent[];
    title: string
    tag?: WorkTagContent[];
    publishedAt: string
    href: string
  }[]
}
