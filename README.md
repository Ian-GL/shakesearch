# ShakeSearch

Hello Pulley team!

This is my submission for the ShakeSearch take-home task. It was very fun to do and I enjoyed having so much freedom in it.

You can try it out [here](https://shakesearch-iangl.onrender.com/)

What this version contains:

- Mention of what play/poem the quote is from
- Case insensitive search
- Formatted results limited to a single paragraph
- Formatted results in verse (respect line breaks)
- Underline of the searched string in the result

Easy to add later:

- Filter by work (since the backend can already distinguish which book the qoute is from this is very easy to implement and would be what I'd do next if given more time)

## Thought process

After some thinking I decided that one of the main things a user could want is to know from which play/poem the quotes are from. That for me was paramount, given the same word or topic can appear in many.

The next thing I thought is how to provide a bit more of value to the user with this information so I added a CTA to get tickets for the play or buy the book in the case of poems. Ideally this would actually be a referral link.

The very next thing I thought about is that given this is poetry and theatre maybe you'll want to listen to it, so I wanted to see the easiest way to achieve this. I tried a bit using Google Translate and that worked well, however their API on text-to-speech requires payment, so I went with the browser speech synthesis which is not as good but gets the job done.

Since this is getting quotes I thought a really useful tool could be the clipboard-copy button. And lastly I think another easy way to monetize would be to offer prints. For my surprise I couldn't find a service where you could input a text and it would show you the preview of a print ready to order.

With all these things planned, the one big missing thing was presentation, so I decided to go with an easy-going style for the page and to focus on segmenting the results text in a way that made sense.

## Hands on

On the backend side most of the project was to actually divide the complete works file into one for each work. Once that was done, the two major changes were to populate many searchers instead of just one and then repeat the search process in a for loop. Even though this means there are now 38 workers, I don't think the performance suffers a lot given the actual string and the suffixArray of the complet works is now divided.

A possible future optimization here would be to use Go routines to parallelize the search work and append the results in the end. At the same time, if filtering by work is added, the loop that searches on each work would just skip any work that doesn't match.

The other small addition to the backend was the case insensitive search, achieved by lower-casing both the query string and the bytes in the suffixArray, while keeping the original casing in the work field of the searcher struct.

On the frontend, apart from adding styles, the segmenting of the results was important. After trying some approaches I decided to split on paragraphs as this provided a very clean presentation and that seemed of the appropriate length except on occassions where the result was a threatical direction (exit, enter scene, etc).

Apart from that, I also made some replacements to avoid incomplete lines at the beggining or the end of the result and lastly, some HTML replacements too to underline the query and change some threatical indications to use bold or italics.

## Future work

- Fuzzy search - It still matches on an exact search. I think the most straight-forward way to do this would be using a library, though this specific case arises some design questions like what should be underlined (most likely in this case the backend should also return what was the part of the string considered a match).

- View in context - Right now you only see the paragraph that contains the quote. This seemed better to me than an arbitrary number of lines below/above. However, it would be good to have a "show in context" button that takes you to the full book and locates you in the paragraph. To achieve this the data where the search happens should already be divided by paragraph so the backend returns the result and the paragraph index.

- Order by relevance. As of now the search happens on the books order alphabetically (except for Sonnets which is on the 1st place). Maybe a more useful search would be to throw the results ordered by the relevance of the play. Most surely users will want to see the quotes of Macbeth or Hamlet rather than the ones of lesser known works.

- Bookmark - If this was to have an account for each user it would be very good to have a system to save particular queries as bookmarks to later come back and read them. This would require an actual authentication system and of course the persistance of the saved results in a DB.

## Things *not* production suited

A _lot_ of things in this project are not production ready.

* Loading Tailwind from a CDN (this was the easiest way to get Tailwind running on the project but it should be installed, use post-css, etc)

* Single-files project. Yes, here everything is in main.go, app.js and index.html. I think the sizes of each file are still manageable but of course on a real project it would be better to define the project architecture before it grows.

* Loading from files. Again, on a real project there would be better ways to handle the data.

### Trivia

The logo and the image for no results were generated with Stable Diffusion. The logo with V1 and while working on the project V2 was realesed, so the no results images was done with it.
