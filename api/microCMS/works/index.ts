import type { MicroCMSListResponse, MicroCMSQueries } from 'microcms-js-sdk'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'

import { client } from '../client'
import type { WorksContent, WorkCategoryContent, WorkTagContent, WorkSkillContent } from './types'

// すべての Worksを取得する
export const getAllWorks = async (queries?: MicroCMSQueries) => {
  const cachedGetAllWorks = unstable_cache(
    async (queries?: MicroCMSQueries) => {
      const listData = await client
        .getAllContents<WorksContent>({
          endpoint: 'works',
          queries,
          customRequestInit: {
            next: {
              tags: ['works'],
              revalidate: 60, // 60秒
            },
          },
        })
        .catch(() => {
          notFound()
        })

      return listData
    },
    ['works-all'],
    {
      tags: ['works'],
      revalidate: 60,
    },
  )
  return cachedGetAllWorks(queries)
}

//  Works一覧を取得する
export const getWorksList = async (queries?: MicroCMSQueries) => {
  const cachedGetWorksList = unstable_cache(
    async (queries?: MicroCMSQueries) => {
      const listData = await client
        .getList<WorksContent>({
          endpoint: 'works',
          queries,
          customRequestInit: {
            next: {
              tags: ['works'],
              revalidate: 60,
            },
          },
        })
        .catch(() => ({
          contents: [],
          totalCount: 0,
          limit: 0,
          offset: 0,
        }))

      return listData
    },
    ['works-list'],
    {
      tags: ['works'],
      revalidate: 60,
    },
  )

  return cachedGetWorksList(queries)
}

// Worksの詳細を取得する
export const getWorksDetail = async (
  contentId?: string,
  draftKey?: string,
  queries?: MicroCMSQueries,
) => {
  const cachedGetWorksDetail = unstable_cache(
    async (contentId?: string, draftKey?: string, queries?: MicroCMSQueries) => {
      const detailData = await client
        .getListDetail<WorksContent>({
          endpoint: 'works',
          contentId: contentId || '',
          queries: {
            draftKey,
            fields:
              'id,title,eyecatch,category,tag,skill,periodStart,periodEnd,pcImg,spImg,content,createdAt,publishedAt,updatedAt,revisedAt',
            ...queries,
          },
          customRequestInit: {
            next: {
              tags: [`works-${contentId}`],
              revalidate: 60,
            },
          },
        })
        .catch(() => {
          notFound()
        })

      return detailData
    },
    ['works-detail'],
    {
      tags: [`works`, `works-${contentId}`],
      revalidate: 60,
    },
  )

  return cachedGetWorksDetail(contentId, draftKey, queries)
}

// Worksの詳細をキャッシュ利用せずに取得する
export const getWorksDetailDraft = async (
  contentId?: string,
  draftKey?: string,
  queries?: MicroCMSQueries,
) => {
  const detailData = await client
    .getListDetail<WorksContent>({
      endpoint: 'works',
      contentId: contentId || '',
      queries: {
        draftKey,
        fields:
          'id,title,eyecatch,category,tag,skill,periodStart,periodEnd,pcImg,spImg,content,createdAt,publishedAt,updatedAt,revisedAt',
        ...queries,
      },
    })
    .catch(() => {
      notFound()
    })

  return detailData
}

// すべてのWorksカテゴリ一覧を取得する
export const getWorkCategoryList = async (queries?: MicroCMSQueries) => {
  const cachedGetWorkCategoryList = unstable_cache(
    async (queries?: MicroCMSQueries) => {
      const listData = await client
        .getAllContents<WorkCategoryContent>({
          endpoint: 'categories',
          queries,
          customRequestInit: {
            next: {
              tags: [`works`],
              revalidate: 60, // 60秒
            },
          },
        })
        .catch(() => {
          return []
        })

      return listData
    },
    ['works-category-list'],
    {
      tags: ['works'],
      revalidate: 60, // 60秒
    },
  )

  return cachedGetWorkCategoryList(queries)
}

// すべてのWorksタグ一覧を取得する
export const getWorkTagList = async (queries?: MicroCMSQueries) => {
  const cachedGetWorkTagList = unstable_cache(
    async (queries?: MicroCMSQueries) => {
      const listData = await client
        .getAllContents<WorkTagContent>({
          endpoint: 'tags',
          queries,
          customRequestInit: {
            next: {
              tags: [`tags`],
              revalidate: 60, // 60秒
            },
          },
        })
        .catch(() => {
          return []
        })

      return listData
    },
    ['tags-category-list'],
    {
      tags: ['tags'],
      revalidate: 60, // 60秒
    },
  )

  return cachedGetWorkTagList(queries)
}

// すべてのWorksスキル一覧を取得する
export const getWorkSkillList = async (queries?: MicroCMSQueries) => {
  const cachedGetWorkSkillList = unstable_cache(
    async (queries?: MicroCMSQueries) => {
      const listData = await client
        .getAllContents<WorkSkillContent>({
          endpoint: 'skills',
          queries,
          customRequestInit: {
            next: {
              tags: [`skills`],
              revalidate: 60, // 60秒
            },
          },
        })
        .catch(() => {
          return []
        })

      return listData
    },
    ['skills-category-list'],
    {
      tags: ['skills'],
      revalidate: 60, // 60秒
    },
  )

  return cachedGetWorkSkillList(queries)
}

//  Worksのカテゴリ詳細を取得する
export const getWorkCategoryDetail = async (contentId: string, queries?: MicroCMSQueries) => {
  const cachedGetWorkCategoryDetail = unstable_cache(
    async (contentId: string, queries?: MicroCMSQueries) => {
      const detailData = await client
        .getListDetail<MicroCMSListResponse<WorkCategoryContent>>({
          endpoint: 'categories',
          contentId,
          queries,
          customRequestInit: {
            next: {
              tags: [`works`],
              revalidate: 60, // 60秒
            },
          },
        })
        .catch(() => ({
          contents: [
            {
              id: '',
              value: '',
              createdAt: '',
              updatedAt: '',
            },
          ],
          totalCount: 0,
          limit: 0,
          offset: 0,
        }))

      return detailData
    },
    ['works-category-detail'],
    {
      tags: ['works'],
      revalidate: 60, // 60秒
    },
  )

  return cachedGetWorkCategoryDetail(contentId, queries)
}

//  Worksのタグ詳細を取得する
export const getWorkTagDetail = async (contentId: string, queries?: MicroCMSQueries) => {
  const cachedGetWorkTagDetail = unstable_cache(
    async (contentId: string, queries?: MicroCMSQueries) => {
      const detailData = await client
        .getListDetail<MicroCMSListResponse<WorkTagContent>>({
          endpoint: 'categories',
          contentId,
          queries,
          customRequestInit: {
            next: {
              tags: [`works`],
              revalidate: 60, // 60秒
            },
          },
        })
        .catch(() => ({
          contents: [
            {
              id: '',
              value: '',
              createdAt: '',
              updatedAt: '',
            },
          ],
          totalCount: 0,
          limit: 0,
          offset: 0,
        }))

      return detailData
    },
    ['works-tag-detail'],
    {
      tags: ['works'],
      revalidate: 60, // 60秒
    },
  )

  return cachedGetWorkTagDetail(contentId, queries)
}

//  Worksのスキル詳細を取得する
export const getWorkSkillDetail = async (contentId: string, queries?: MicroCMSQueries) => {
  const cachedGetWorkSkillDetail = unstable_cache(
    async (contentId: string, queries?: MicroCMSQueries) => {
      const detailData = await client
        .getListDetail<MicroCMSListResponse<WorkSkillContent>>({
          endpoint: 'skills',
          contentId,
          queries,
          customRequestInit: {
            next: {
              tags: [`works`],
              revalidate: 60, // 60秒
            },
          },
        })
        .catch(() => ({
          contents: [
            {
              id: '',
              value: '',
              createdAt: '',
              updatedAt: '',
            },
          ],
          totalCount: 0,
          limit: 0,
          offset: 0,
        }))

      return detailData
    },
    ['works-skill-detail'],
    {
      tags: ['works'],
      revalidate: 60, // 60秒
    },
  )

  return cachedGetWorkSkillDetail(contentId, queries)
}

//  URLのカテゴリー名からmicroCMSのカテゴリーIDを取得する関数
export const getWorksCategoryIdFromParams = async (category: string) => {
  const categoryRes = await getWorkCategoryDetail('', {
    limit: 1,
    filters: `value[equals]${category}`,
  })

  if (categoryRes.contents.length === 0 || !categoryRes.contents[0].id) {
    return
  }

  return categoryRes.contents[0].id
}

//  すべてのWorksカテゴリーとそのカテゴリーに属するWorksの数を取得する関数
export const getAllCategoryWithTotalCount = async () => {
  const cachedGetAllCategoryWithTotalCount = unstable_cache(
    async () => {
      const allExistCategoryWorks = await getAllWorks({
        fields: 'category',
        filters: 'category[exists]',
      })

      // カテゴリの重複を除去し、各カテゴリの詳細情報を保持
      const uniqueCategoriesMap = new Map()

      allExistCategoryWorks.forEach((item) => {
        if (item.category) {
          item.category.forEach((category) => {
            if (category && category.id) {
              if (!uniqueCategoriesMap.has(category.id)) {
                uniqueCategoriesMap.set(category.id, category)
              }
            }
          })
        }
      })

      const uniqueCategories = Array.from(uniqueCategoriesMap.values())

      const existCategory = uniqueCategories.map((category) => {
        const totalCount = allExistCategoryWorks.filter((item) =>
          item.category?.some((cat) => cat && cat.id === category.id),
        ).length
        return {
          ...category,
          totalCount,
        }
      })
      return existCategory
    },
    ['works-category-with-total-count'],
    {
      tags: ['works'],
      revalidate: 60, // 60秒
    },
  )

  return cachedGetAllCategoryWithTotalCount()
}
