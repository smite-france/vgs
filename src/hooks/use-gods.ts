import { useQuery } from 'react-query'
import ky from 'ky'

type GodsType = Array<{
  id: string
  name: string
  skins: Array<{ id: string; name: string }>
}>

export const useGods = () => {
  return useQuery({
    queryKey: ['gods'],
    queryFn: async () => {
      const res = await ky.get('/api.php?c=gods')
      return await res.json<GodsType>()
    },
  })
}
