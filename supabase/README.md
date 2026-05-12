# Supabase Setup

1. Create a Supabase project.
2. Enable Email + Password auth in Authentication settings.
3. Add the values from Project Settings > API to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Run `supabase/schema.sql` in the Supabase SQL editor.
5. Create your admin user in Authentication.
6. Insert that user's id into `public.admin_users`.
7. Create or confirm the public Storage bucket named `project-assets` exists for project images, PDFs, and videos. The SQL file also attempts to create the bucket and storage policies.

Project rows should use the current frontend JSON shape:

```json
{
  "slug": "11-bleu",
  "title": "11 BLEU",
  "section": "projects",
  "tags": ["CMF", "Fashion", "Systems Design"],
  "disciplines": ["Material Development", "Biodesign", "Systems Design"],
  "card_image": {
    "src": "https://YOUR-PROJECT.supabase.co/storage/v1/object/public/project-assets/projects/...",
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

Use `section: "projects"` for the Projects page and home carousel eligibility. Use `section: "research"` for the Research & Insights page.

Do not store new uploaded media as base64 in project JSON. The admin form uploads files to Supabase Storage and saves the resulting public URL in the same `src` fields. Older base64 entries can still render until they are migrated.

The public resume button points to `project-assets/projects/Resume/resume.pdf`. Use the hidden `/login/resume` admin route to overwrite that PDF.
