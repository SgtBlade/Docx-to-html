import './App.css';
import { useState } from 'react';
import style from './App.module.css'


const App = () => {

  const [articles, setArticles] = useState([])

  //Loading the files
  const loadFile = async (e) => {
    e.preventDefault();

    //Conversion to an array since it's an HTML collection
    [...e.target.files].forEach((file, key) => {

      //We have to create a new reader every time otherwise it'll throw errors
      const reader = new FileReader();
      //Keeping an index and preparing the title
      const docIndex = key;
      const chapterName = file.name.replace(".rtf", "");

      //Here starts the actual reading of the file
      reader.onload = async (readerEvt) => {

        //Standard things to read the file
        let content = readerEvt.target.result.split('lang9')[1].split("\\par");
  
        //Prepare a parent article. This article will include all the data from one word file
        const $parent = document.createElement('article')
        const $title = document.createElement('h2');
        $title.textContent = `Chapter ${chapterName}`;
        //If you do not want a new title for every new file, just comment the line below out
        $parent.appendChild($title)
        
        //We need another conversion to array so that we can call a foreach
        await Array.prototype.forEach.call(content, (paragraphItem, paragraphKey) => {
          
          if(paragraphItem !== "\r\n" 
          &&   paragraphItem !== " \\fs20" 
          &&   paragraphItem !== " \\fs32" 
          &&   !paragraphItem.includes("}")){
            const $paragraph = document.createElement('p');
            $paragraph.textContent = paragraphItem
              .replaceAll("\\ldblquote ", "\"")
              .replaceAll("\\rdblquote", "\"")
              .replaceAll("\\rquote ", "\'")
              .replaceAll("\\\lquote", "\'")
              .replaceAll("\\rquote ", "\'")
              .replaceAll("!\\rquote ", "\'")
              .replaceAll("!\rquote ", "\'")
              .replaceAll("\\'85", "...")
              .replaceAll("\\b0", "")
              .replaceAll("\\b5", "")
              .replaceAll("\\b", "")
              .replaceAll("\\fs32", "")
              .replaceAll("\\fs20", "")
              .replaceAll("\\line", "")
              .replaceAll("TO BE CONTINUED...", "");

              $paragraph.textContent.replaceAll("  ", " ")
              if($paragraph.textContent !== "" && $paragraph.textContent !== " ") $parent.appendChild($paragraph)
          }

        })
  
        //Adding the new articles to the array
        let OGArticles = articles;
        OGArticles.push({chapter: parseInt(chapterName), chapterContent: $parent})
        setArticles(OGArticles)
        
        
      };
      reader.readAsBinaryString(file);

    })
  };

  //Displaying the content from the files
  const showContent = async () => {
    let usingArticles = articles;
    //I didn't use a docIndex but sorted based on the name. If you change the above code a little (docIndex variable)
    //you could re-enable this sort function if they weren't sorted yet
    usingArticles = usingArticles.sort((a, b) => a.chapter - b.chapter);
    usingArticles.forEach(article => document.querySelector('.output').appendChild(article.chapterContent))
    setArticles(usingArticles);
  }

  //Downloading the files
  const downloadFiles = async (individual = false) => {

    if(!individual){
      console.log('testing here this okey')
      //Clearing everything on the page, we don't need any clutter
      const $body = document.querySelector('body');
      const $head = document.querySelector('head');
      $head.innerHTML = "";
      $body.innerHTML = "";
      document.title = "Title here";
      const $h1 = document.createElement('h1');
      $h1.textContent = "Title here"
      $body.appendChild($h1);

      //Adding all the articles/documents to a clean page
      articles.forEach(async (element, key) => {
          $body.appendChild(element.chapterContent)
      })

      //Creating a hidden download button and triggering it
      let hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:attachment/text,' + encodeURI(document.documentElement.outerHTML);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'output.html';
      hiddenElement.click();

      //Reloading the page 
      window.location.reload();
    }
    else {
    articles.forEach(article => {
      //Clearing everything on the page, we don't need any clutter
      const $body = document.querySelector('body');
      const $head = document.querySelector('head');
      $head.innerHTML = "";
      $body.innerHTML = "";
      const title = article.chapterContent.querySelector('h2').textContent;
      document.title = title;
      $body.appendChild(article.chapterContent)

      //Creating a hidden download button and triggering it
      let hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:attachment/text,' + encodeURI(document.documentElement.outerHTML);
      hiddenElement.target = '_blank';
      hiddenElement.download = `${title}.html`;
      hiddenElement.click();
    }).then(window.location.reload())

  }
}



  return (
    <div className="App">
      <div className={style.wrapper}>
        
          <input className={style.uploadZone} type="file" onChange={(e) => loadFile(e)} multiple />
          <input className={`${style.button} ${style.showChapter}`} type="button" onClick={showContent} value="ShowChapters" />
          <input className={style.button} type="button" onClick={() => {downloadFiles(true)}} value="Download individually" />
          <input className={style.button} type="button" onClick={()=> {downloadFiles(false)}} value="Download" />
      </div>
          <span className='error'></span>

          <section className='output'></section>
    </div>
  );
}

export default App;
