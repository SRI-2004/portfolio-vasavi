# Project Entry Field Guide

This guide explains what each Create/Edit Project field means, what to enter, and where it appears on the website.

## How To Use This Form

- Start each new project as `Draft`. Draft projects stay hidden from the public website.
- Switch to `Published` only when the project is ready to show.
- Uploaded images should be small, ideally under 10 MB. Uploads are stored as files and the project saves their public URL.
- Choose the project type first. `Normal` projects use flexible media blocks. `Scrapbook` projects use a focused book viewer with a PDF or page images.
- Use clear alt text for every image. Describe what is in the image for someone who cannot see it.
- If a field is optional and you leave it blank, that part is usually skipped on the public page.

## Basics

| Form field | What to enter | Required? | Where it appears | Notes |
|---|---|---:|---|---|
| Title | The project name, such as `11 BLEU` or `Pseudocorium`. | Yes | Home WORK carousel, `/projects` grid, individual project page heading, browser page title. | This is the main visible project name. |
| Slug | A short URL name using lowercase letters, numbers, and hyphens, such as `11-bleu`. | Yes | The project page URL: `/projects/your-slug`. | This should be unique. Changing it changes the public project link. |
| Project type | Choose `Normal` or `Scrapbook`. | Yes | Individual project page media area. | Normal projects use media blocks. Scrapbook projects use a two-page book viewer. |
| Status | Choose `Draft` or `Published`. | Yes | Controls whether the project appears publicly. | Draft projects appear only in the admin dashboard. Published projects can appear on the website. |
| Sort order | A number used to order projects. Lower numbers appear earlier. | Yes | Home WORK carousel and `/projects` grid order. | Use spacing like `10`, `20`, `30` so projects can be inserted later. |
| Featured on home | Turn on if the project should appear in the home page WORK carousel. | Optional | Home WORK carousel. | The project must also be `Published` to appear publicly. |

## Classification

| Form field | What to enter | Required? | Where it appears | Notes |
|---|---|---:|---|---|
| Tags | Select one or more broad filters, such as `Biomaterials`, `CMF`, `Social Impact`, `Fashion`, or `Systems Design`. | Optional | `/projects` filter row and filter counts. | These control which filter buttons include the project. |
| Disciplines | Add the short category line for the project, such as `Material Development`, `Biodesign`, `Systems Design`. | Yes | Under project thumbnails on the home page and `/projects` page. Also used on the individual project page if no separate categories are entered. | Each added line becomes part of the project's category description. |

## Card Image

The card image is the main thumbnail image for the project.

| Form field | What to enter | Required? | Where it appears | Notes |
|---|---|---:|---|---|
| Image source: URL | Paste a direct image URL. | Required unless using upload. | Home WORK carousel and `/projects` grid thumbnails. Also used as the fallback image on the project page if no media is added. | Use this when the image already exists online. |
| Image source: Upload | Choose a small image file from your computer. | Required unless using URL. | Same as URL mode. | The image is uploaded as a file and the project stores its public URL. Keep it under 10 MB. |
| Alt text | A short description of the thumbnail image. | Yes | Used by screen readers and when the image cannot load. | Example: `Blue sculptural bottle above water ripples`. |
| Caption | Optional text describing the image. | Optional | Not shown for the home or `/projects` thumbnail. May show only if this image is used as fallback media. | Usually leave blank for thumbnails. |
| Aspect | Choose `Wide`, `Square`, or `Portrait`. | Optional | Helps media images display with the intended shape. | The project cards use the site thumbnail style; this is most useful when the image appears in the project media area. |
| Preview | Shows the selected URL or uploaded image. | No | Admin form only. | This helps confirm that the selected image is correct. |

## Detail Intro

These fields shape the left information column on the individual project page.

| Form field | What to enter | Required? | Where it appears | Notes |
|---|---|---:|---|---|
| Client | Brand, organization, client, or project owner. | Optional | Individual project page, below the project title. | Appears before the year if both are entered. |
| Year | Project year, such as `2023` or `2024`. | Optional | Individual project page, beside the client. | Appears as `Client, Year` when both are filled. |
| Categories | A descriptive category line for the project detail page. | Optional | Individual project page, below client/year. | If left blank, the page uses Disciplines instead. |
| Headline | A short statement or headline explaining the project. | Yes | Individual project page sidebar and browser page description. | This should summarize the main idea of the project. |
| Summary paragraphs | One or more paragraphs explaining the project. | Yes | Individual project page sidebar, below the headline. | Use multiple paragraphs for easier reading. |
| Add hero image override | Turn on if you want a separate fallback hero image for the project page. | Optional | Individual project page fallback media only. | This does not replace the card thumbnail on the home or `/projects` pages. |
| Hero image source | URL or uploaded image for the fallback hero image. | Optional | Individual project page if no media blocks are added. | If no media exists, this appears before the card image fallback. |
| Hero image alt text | Description of the hero image. | Required if a hero image source is entered. | Used by screen readers and image fallback behavior. | Keep it specific and descriptive. |
| Hero image caption | Optional text under the hero image. | Optional | Individual project page if the hero image is used in the media area. | Leave blank if no caption is needed. |
| Hero image aspect | Wide, square, or portrait. | Optional | Individual project page media area. | Controls the intended image shape. |

## Sidebar Extras

These fields add supporting information to the individual project page sidebar.

| Form field | What to enter | Required? | Where it appears | Notes |
|---|---|---:|---|---|
| Buzz | Awards, press, recognition, or notable mentions. | Optional | Individual project page sidebar under the `BUZZ` heading. | Each item appears as its own paragraph. |
| Credits | Collaborators, agencies, roles, or acknowledgements. | Optional | Bottom area of the individual project page sidebar. | Use one credit per line. |
| Link label | The visible text for a link, such as `Project website` or `Press feature`. | Optional | Individual project page sidebar link area. | A link appears only when both label and URL are filled. |
| Link URL | The destination URL for the link. | Optional | Individual project page sidebar link area. | Use the full URL, including `https://`. |

## Normal Project Media Blocks

Normal project media blocks appear in the large right-side media column on the individual project page. They appear in the order you add them. Use the `Up` and `Down` buttons to reorder them.

If a project has no media blocks, the project page shows the hero image if one exists. If there is no hero image, it shows the card image.

### Video Block

| Form field | What to enter | Required? | Where it appears | Notes |
|---|---|---:|---|---|
| Provider | Choose `YouTube`, `Vimeo`, or `File`. | Yes | Individual project page media column. | Choose the platform that matches the video URL. |
| Video URL | The YouTube, Vimeo, or direct file video link. | Yes | Individual project page media column. | YouTube and Vimeo videos appear as embedded players. File videos appear as a standard video player. |
| Upload video file | Choose a video file from your computer. | Optional | Individual project page media column. | Uploading sets the provider to File and stores a public video URL. Keep videos under 50 MB. |
| Poster URL or uploaded poster | Optional preview image for the video. | Optional | Used as the poster image for file videos. Also used as fallback if a file video has no playable URL. | You can paste a URL or upload a poster image. |
| Upload poster | Choose a small poster image from your computer. | Optional | Same as poster URL. | Keep uploaded poster images under 10 MB. |
| Title | A short video title. | Optional | Used for the embedded video title and accessibility. | Helpful for screen readers and browser context. |

### Image Block

| Form field | What to enter | Required? | Where it appears | Notes |
|---|---|---:|---|---|
| Image source: URL | Paste a direct image URL. | Required unless using upload. | Individual project page media column. | Use for one standalone image. |
| Image source: Upload | Choose a small image file from your computer. | Required unless using URL. | Individual project page media column. | The image is uploaded as a file and the project stores its public URL. Keep it under 10 MB. |
| Alt | Description of the image. | Yes | Used by screen readers and when the image cannot load. | Be specific. |
| Caption | Optional caption under the image. | Optional | Individual project page below that image. | Use only when the image needs extra context. |
| Aspect | Wide, square, or portrait. | Optional | Individual project page media column. | Helps the image display in the right shape. |

### Gallery Block

| Form field | What to enter | Required? | Where it appears | Notes |
|---|---|---:|---|---|
| Gallery title | Optional title for the image group. | Optional | Individual project page above the gallery. | Use when the gallery needs a label. |
| Gallery caption | One shared caption for the whole gallery. | Optional | Individual project page below a collage gallery. | Use this for collage layouts when multiple images should share one caption. |
| Layout | Choose `Grid`, `Masonry`, `Strip`, or `Collage`. | Optional | Individual project page gallery layout. | Grid is the safest default. Collage combines images into one composed block. |
| Gallery images | Add one or more images. | Yes, at least one image. | Individual project page media column. | Each image has the same source, alt, caption, and aspect options as a single image block. |

### Collage Gallery Notes

Use the `Collage` layout when several images should read as one composed visual group instead of separate images. A two-image collage makes the first image smaller and the second image larger, so the pair forms a balanced rectangle. Three or more images are arranged into a compact composition. The collage uses one shared Gallery caption below the whole group.

## Scrapbook Project Media

Scrapbook projects use one dedicated book viewer instead of normal media blocks. The left project information column stays the same as every other project.

| Form field | What to enter | Required? | Where it appears | Notes |
|---|---|---:|---|---|
| Scrapbook title | Optional title for the book section. | Optional | Individual project page above the book viewer. | Use when the book needs a label. |
| Scrapbook caption | One shared caption for the book. | Optional | Individual project page below the book viewer. | Use for a short note about the report, process book, or page set. |
| Scrapbook PDF source: URL | Paste a PDF URL. | Optional | Individual project page scrapbook viewer. | If a PDF is provided, it becomes the main book pages. |
| Scrapbook PDF source: Upload | Choose a PDF file from your computer. | Optional | Individual project page scrapbook viewer. | The PDF is uploaded as a file and the project stores its public URL. Keep it under 20 MB. |
| Scrapbook PDF name | A short name for the PDF. | Optional | Used for page descriptions and admin clarity. | Helpful when several reports or books are being managed. |
| Fallback page images | Add one or more finished page images. | Required only when no PDF is provided. | Individual project page scrapbook viewer if no PDF exists or the PDF cannot load. | Each image is one page. Use clear alt text for every page. |

On desktop, the project page shows two pages at once with Previous and Next controls. On mobile, it shows one page at a time. If both a PDF and fallback page images are entered, the PDF is used first.

### Text Block

| Form field | What to enter | Required? | Where it appears | Notes |
|---|---|---:|---|---|
| Eyebrow | A small label above the text block. | Optional | Individual project page media column. | Example: `Process`, `Material Study`, or `Outcome`. |
| Title | A heading for the text block. | Optional | Individual project page media column. | Use when the text block introduces a section. |
| Body paragraphs | One or more paragraphs. | Yes | Individual project page media column. | This is useful for process notes, explanations, or case-study details between images. |

## Visibility Map

| Website area | Uses these fields |
|---|---|
| Home page WORK carousel | Title, disciplines, card image, featured on home, sort order, published status. |
| `/projects` page | Title, slug, tags, disciplines, card image, sort order, published status. |
| `/projects` filters | Tags and published status. |
| Individual project page sidebar | Title, client, year, categories or disciplines, headline, summary paragraphs, buzz, links, credits. |
| Individual project page media column | Normal media blocks or Scrapbook book viewer. If a normal project has no media blocks, hero image is used. If no hero image exists, card image is used. |
| Browser page title | Project title. |
| Browser page description | Headline. |
| Admin dashboard only | Draft projects, status controls, delete, edit, updated date. |

## Practical Examples

### Draft Project

Use `Draft` status while entering content. The project stays visible in the admin dashboard but does not appear on the home page, `/projects`, or its public project page.

### Featured Homepage Project

To show a project on the home WORK carousel, set the project to `Published`, turn on `Featured on home`, add a strong card image, and give it a low sort order number.

### Project With Video And Gallery

Choose `Normal`. Add a Video block first so the video appears at the top of the media column. Add a Gallery block after it for process images, final assets, or documentation. Use captions only when they add helpful context.

### Scrapbook Project

Choose `Scrapbook`. Add the same basic project information, then upload a PDF or add finished page images. The public project page will show the pages as a book viewer.

### Project With No Media

If no media blocks are added, the individual project page still shows an image. It first looks for a hero image override. If there is no hero image, it uses the card image.

## Recommended Workflow

1. Create the project as a draft.
2. Add the required basics: title, slug, status, sort order.
3. Add classification: at least one discipline, and tags if the project should be filterable.
4. Add the card image and alt text.
5. Fill in the detail intro: headline and summary paragraphs.
6. Add optional sidebar extras: buzz, credits, and links.
7. For Normal projects, add media blocks in the order they should appear.
8. For Scrapbook projects, add a PDF or fallback page images.
9. Change status to published when ready.
10. Check the home page, `/projects`, and the individual project page.
11. Return to the dashboard to edit, unpublish, or delete the project later.
