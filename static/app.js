const Controller = {
  search: (ev) => {
    ev.preventDefault();
    const form = document.getElementById("form");
    const data = Object.fromEntries(new FormData(form));
    const response = fetch(`/search?q=${data.query}`).then((response) => {
      response.json().then((results) => {
        Controller.updateQuotes(results, data.query);
      });
    });
  },

  updateQuotes: (resultsObjs, queryStr) => {
    const quotesContainer = document.getElementById("quotes-container");
    let works = [];
    let idx = 0;
    for (let resObj of resultsObjs) {
      const {Title, Results, Type} = resObj;
      const quotes = [];

      if ( Results.length > 0) {
        ctaLink = Type == "play" ?
          `https://www.ticketmaster.com/search?q=${encodeURI(Title)}` : `https://www.amazon.com/s?k=shakespeare+${encodeURI(Title)}`;

        ctaText = Type == "play" ? "Get tickets&nbsp;&nbsp;&nbsp;🎫" : "Buy book 📗";

        formattedQuotes = Format.quotes(Results, queryStr, idx);

        works.push(`
          <div class="flex flex-col ${idx == 0 ? "mt-2" : "mt-10"}">
            <div class="flex flex-row mb-2">
              <h3 class="bg-white border-2 border-orange-300 px-4 py-2 rounded-full font-extrabold text-lg">${Title}</h3>
              <a
                class="ml-4 mt-1 px-2 py-2 border-2 border-orange-300 rounded-full cursor-pointer focus:outline-pink-800"
                href="${ctaLink}" target="_blank"
              >
                ${ctaText}
              </a>
            </div>
            ${formattedQuotes}
          </div>
        `);
      }

      idx += Results.length;
    }

    var formattedResult = "";

    if(idx == 0){
      formattedResult =`
        <div class="flex flex-col justify-center text-center text-xl mt-6">
          <img class="rounded-full self-center mb-8 w-64 h-64" src="https://s3.amazonaws.com/testbucket.iangl/surprised_shakespeare.png"/>
          <p>
            I don't remember writing any of that.
          </p>
          <p>
            Ist thou sure?
          </p>
          <p>
            You could try with a different punctuation, for example: To be<b>,</b> or not to be
          </p>
        </div>
      `;
    } else {
      formattedResult = works.join("")
    }

    quotesContainer.innerHTML =`
    <div>
      <div class="text-end italic">${idx} result${idx == 1 ? "" : "s"}</div>
      ${ formattedResult }
    </div>
    `;
  },
};

const Utils = {
  removeFirstLine: (string) => {
    return string.substring(string.indexOf("\n") + 1);
  },
  removeLastLine: (string) => {
    return string.substring(0, string.lastIndexOf("\n"));
  },
}

const Format = {
  quotes: (quotes, queryStr, idxAcc) => {
    let formattedQuotes = [];

    for(let originalResult of quotes) {
      // Clean to a better text-plain version
      const lowercaseQuery = queryStr.toLowerCase();
      resultText = Format.quoteText(originalResult, lowercaseQuery);

      // Start with HTML changes
      const qRegex = new RegExp(queryStr, 'gi');

      resultHTML = resultText.replaceAll(qRegex, (match) => {
        return "<span class=\"underline decoration-orange-300 decoration-4\">" + match + "</span>";
      });

      resultHTML = resultHTML.replaceAll(/\[_(.*)_\]/g, (_, group) =>{
        return "<b>" + group + "</b>";
      });

      resultHTML = resultHTML.replaceAll(/_(.*?)_/g, (_, group) => {
        return "<i>" + group + "</i>";
      });

      resultHTML = resultHTML.replaceAll("\n", "<br/>");

      idxAcc += 1;

      formattedQuotes.push(`
        <div class="flex flex-col mt-4 bg-white px-8 py-4 rounded-lg max-w-4xl">
          <div class="flex flex-row justify-between">
            <p class="mb-2" id="quote-${idxAcc}" data-text="${resultText}">
              ${resultHTML}
            </p>
            <div class="ml-8">
              <button class="h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer mb-2"
                onClick="speakContent(${idxAcc})"
              >
                <svg enable-background="new 0 0 24 24" height="20" viewBox="0 0 24 24" width="20" focusable="false">
                  <g>
                    <rect fill="none" height="24" width="24"></rect>
                  </g>
                  <g>
                    <g>
                      <path
                        d="M3,9v6h4l5,5V4L7,9H3z M16.5,12c0-1.77-1.02-3.29-2.5-4.03v8.05C15.48,15.29,16.5,13.77,16.5,12z M14,3.23v2.06 c2.89,0.86,5,3.54,5,6.71s-2.11,5.85-5,6.71v2.06c4.01-0.91,7-4.49,7-8.77S18.01,4.14,14,3.23z">
                      </path>
                    </g>
                  </g>
                </svg>
              </button>
              <button class="h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer mb-2"
                onClick="copyContent(${idxAcc})"
              >
                <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" width="20">
                  <path
                    d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z">
                  </path>
                </svg>
              </button>
            </div>
          </div>
          <a
            class="self-end font-semibold decoration-solid cursor-pointer text-gray-400"
            href="https://printify.com/app/editor/1140/66"
            target="_blank"
          >
            Get a print
          </a>
        </div>
      `);
    }

    return formattedQuotes.join("");
  },
  quoteText: (text, queryStr) => {
    const paragraphs = text.split("\n\n");

    const paragraphIdx = paragraphs.findIndex((p, idx) => {
      const lowercaseText = p.toLowerCase();
      const hasQuery = lowercaseText.includes(queryStr);

      return hasQuery;
    });

    let paragraph = paragraphs[paragraphIdx];

    // If it is the first or last paragraph,
    // remove the first or last line respectively.
    if(paragraphIdx == 0) {
      paragraph = Utils.removeFirstLine(paragraph);
    }

    if(paragraphIdx == paragraphs.length - 1) {
      paragraph = Utils.removeLastLine(paragraph);
    }

    return paragraph;
  }
};

const form = document.getElementById("form");
form.addEventListener("submit", Controller.search);

const copyContent = async (id) => {
  const text = getTextFromId(id);
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Could not copy to clipboard: ', err);
  }
};

const synth = window.speechSynthesis;

const speakContent = async (id) => {
  if ("speechSynthesis" in window) {
    voices = synth.getVoices();

    const text = getTextFromId(id);
    const utterThis = new SpeechSynthesisUtterance(text);

    if (voices[33]) {
      utterThis.voice = voices[33];
    }
    utterThis.rate = 0.65;
    synth.speak(utterThis);
  } else {
    alert("Sorry, your browser doesn't support speech synthesis");
    return;
  }
};

const getTextFromId = (id) => {
  return document.getElementById(`quote-${id}`)?.getAttribute("data-text");
};
