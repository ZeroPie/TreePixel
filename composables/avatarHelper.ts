export const useAvatarHelper = () => {
  const supabase = useSupabaseClient()
  async function downloadAvatar(avatarPath: string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(avatarPath)
      if (error) {
        console.log("Download Error ", error)
      }
      if (data) {
        return URL.createObjectURL(data);
      } else {
        return "";
      }
    } catch (error: any) {
      console.error('Error downloading image: ', error.message)
      return ""
    }
  }
  return {
    downloadAvatar
  }
}
