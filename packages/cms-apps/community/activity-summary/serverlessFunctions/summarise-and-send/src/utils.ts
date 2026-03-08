export const request = async (route: string, authToken?: string) => {
  const response = await fetch(
    `https://api.cms.com/rest/${route}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CMS_API_KEY}`
      },
    }
  )

  const json = await response.json()
  return json.data
}
