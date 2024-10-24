import useSWR from 'swr'
import ky from 'ky'

export const useGodVgs = (args: { god: string; skin: string }) => {
  return useSWR<Array<string>>(
    `/api.php?c=god&m=vgs&god=${args.god}&skin=${args.skin}`,
    (url: string): Promise<Array<string>> => {
      return ky.get(url).json()
    }
  )
}
