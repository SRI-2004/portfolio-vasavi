# Supabase Setup

1. Create a Supabase project.
2. Enable Email + Password auth in Authentication settings.
3. Add the values from Project Settings > API to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Run `supabase/schema.sql` in the Supabase SQL editor.
5. Create your admin user in Authentication.
6. Insert that user's id into `public.admin_users`.
7. Create a public Storage bucket named `project-assets` for project images and videos.

Project rows should use the current frontend JSON shape:

```json
{
  "slug": "11-bleu",
  "title": "11 BLEU",
  "tags": ["CMF", "Fashion", "Systems Design"],
  "disciplines": ["Material Development", "Biodesign", "Systems Design"],
  "card_image": {
    "src": "https://...",
    "alt": "Project thumbnail"
  },
  "featured_on_home": true,
  "sort_order": 1,
  "status": "published",
  "detail": {
    "client": "Concept Fragrance Study",
    "year": "2024",
    "categories": ["Product Design", "CMF"],
    "headline": "A perfume object imagined through form and material finish.",
    "summary": ["Paragraph one.", "Paragraph two."],
    "media": [
      {
        "type": "video",
        "provider": "youtube",
        "url": "https://www.youtube.com/embed/VIDEO_ID",
        "title": "Project film"
      }
    ]
  }
}
```
