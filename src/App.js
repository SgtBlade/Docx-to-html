import './App.css';
import PizZip from 'pizzip';
import { useState } from 'react';
import style from './App.module.css'

const App = () => {

  const [articles, setArticles] = useState([])


  //Required for the loadFile function
  //found this online Answer 3: https://www.anycodings.com/questions/get-docx-file-contents-using-javascriptjquery
  const str2xml = (str) => {
    if (str.charCodeAt(0) === 65279) {
        // BOM sequence
        str = str.substr(1);
    }
    return new DOMParser().parseFromString(str, "text/xml");
  }

  //Loading the files
  const loadFile = async (e) => {
    e.preventDefault();

    //Conversion to an array since it's an HTML collection
    [...e.target.files].forEach((file, key) => {

      //We have to create a new reader every time otherwise it'll throw errors
      const reader = new FileReader();
      //Keeping an index and preparing the title
      const docIndex = key;
      const chapterName = file.name.replace(".docx", "");

      //Here starts the actual reading of the file
      reader.onload = async (readerEvt) => {

        //Standard things to read the file
        const content = readerEvt.target.result;
        const zip = new PizZip(content);
        const xml = str2xml(zip.files["word/document.xml"].asText());

        //Getting all the text from the file
        const paragraphsXml = xml.getElementsByTagName("w:p");
  
        //Prepare a parent article. This article will include all the data from one word file
        const $parent = document.createElement('article')
        const $title = document.createElement('h2');
        $title.textContent = chapterName;
        //If you do not want a new title for every new file, just comment the line below out
        $parent.appendChild($title)
        
        //We need another conversion to array so that we can call a foreach
        await Array.prototype.forEach.call(paragraphsXml, (paragraphsXmlItem) => {
          //Getting all the text elements & creating a new paragraph
          const xmlItems = paragraphsXmlItem.getElementsByTagName("w:t");
          const $paragraph = document.createElement('p');
          //I hadn't tried this method for a "for" loop yet, it's pretty much a foreach
          for (const el of xmlItems){$paragraph.textContent += el.textContent;}
          //Just filtering out the empty lines (it happens sometimes)
          if($paragraph.innerHTML !== '') $parent.appendChild($paragraph)
        })
  
        //Adding the new articles to the array
        let OGArticles = articles;
        OGArticles.push({chapter:docIndex, chapterContent: $parent})
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
    //usingArticles = usingArticles.sort((a, b) => a.chapter - b.chapter);
    usingArticles.forEach(article => document.querySelector('.output').appendChild(article.chapterContent))
  }

  //Downloading the files
  const downloadFiles = async (individual = false) => {

    if(!individual){
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
      await articles.forEach(async element => {
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
          <input className={style.button} type="button" onClick={downloadFiles} value="Download" />
      </div>
          <span className='error'></span>

          <section className='output'></section>
    </div>
  );
}

export default App;
