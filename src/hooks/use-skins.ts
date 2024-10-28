import { useQuery } from 'react-query'
import ky from 'ky'

type SkinsType = Array<{
  id: string
  id_god: string
  name: string
}>

export const useSkins = () => {
  return useQuery({
    queryKey: ['skins'],
    queryFn: async () => {
      const res = await ky.get('/api.php?c=skins')
      return await res.json<SkinsType>()
    },
  })
}
