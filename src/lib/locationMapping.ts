export const REGION_TO_COUNTRIES: Record<string, string[]> = {
  europe: ["germany", "france", "spain", "italy", "uk", "united kingdom", "netherlands", "poland", "sweden", "ireland", "portugal", "belgium"],
  apac: ["india", "australia", "japan", "singapore", "new zealand", "south korea", "philippines"],
  latam: ["brazil", "mexico", "argentina", "colombia", "chile", "peru"],
  namer: ["us", "usa", "united states", "canada", "america"],
  mena: ["uae", "united arab emirates", "saudi arabia", "egypt", "israel", "jordan"]
};

export const COUNTRY_TO_CITIES: Record<string, string[]> = {
  germany: ["berlin", "munich", "hamburg", "frankfurt", "cologne"],
  france: ["paris", "lyon", "marseille"],
  spain: ["madrid", "barcelona", "valencia"],
  uk: ["london", "manchester", "edinburgh", "bristol"],
  "united kingdom": ["london", "manchester", "edinburgh", "bristol"],
  netherlands: ["amsterdam", "rotterdam", "the hague"],
  us: ["new york", "san francisco", "austin", "seattle", "chicago", "boston", "los angeles", "remote us"],
  usa: ["new york", "san francisco", "austin", "seattle", "chicago", "boston", "los angeles", "remote us"],
  "united states": ["new york", "san francisco", "austin", "seattle", "chicago", "boston", "los angeles", "remote us"],
  canada: ["toronto", "vancouver", "montreal", "ottawa"],
  australia: ["sydney", "melbourne", "brisbane", "perth"]
};
