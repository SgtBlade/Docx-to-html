import './App.css';
import PizZip from 'pizzip';
import { useState } from 'react';
import style from './App.module.css'

const App = () => {

  const [articles, setArticles] = useState([])


  const str2xml = (str) => {
    if (str.charCodeAt(0) === 65279) {
        // BOM sequence
        str = str.substr(1);
    }
    return new DOMParser().parseFromString(str, "text/xml");
  }

  const showFile = async (e) => {
    e.preventDefault();
    [...e.target.files].forEach((file, key) => {

      const reader = new FileReader();
      const chapterNumber = parseInt(file.name.replace(".docx", ""))
      const chapterName = `Chapter ${chapterNumber}`
      reader.onload = async (readerEvt) => {
        const content = readerEvt.target.result;
  
        const zip = new PizZip(content);
        const xml = str2xml(zip.files["word/document.xml"].asText());
        const paragraphsXml = xml.getElementsByTagName("w:p");
  
  
        const $parent = document.createElement('article')
        const $title = document.createElement('h2');
        $title.textContent = chapterName;
        $parent.appendChild($title)
        
        await Array.prototype.forEach.call(paragraphsXml, (paragraphsXmlItem, key) => {
          const xmlItems = paragraphsXmlItem.getElementsByTagName("w:t");
          const $paragraph = document.createElement('p');
          for (const el of xmlItems) {
            const textFromElement = el.textContent
            if(!textFromElement.includes('TO BE CONTINUED')) {
              $paragraph.textContent += textFromElement;
            }
          }
  
          if($paragraph.innerHTML !== '') $parent.appendChild($paragraph)
        })
  
        let OGArticles = articles;
        OGArticles.push({chapter:chapterNumber, chapterContent: $parent})
        setArticles(OGArticles)
  
      };
      reader.readAsBinaryString(file);

    })
  };

  const showContent = async () => {
    let usingArticles = articles;
    usingArticles = usingArticles.sort((a, b) => a.chapter - b.chapter);
    usingArticles.forEach(article => {
      document.querySelector('.output').appendChild(article.chapterContent)
    })
    checkChapters(usingArticles);
  }

  const checkChapters = async (usingArticles) => {

    let countNumber = usingArticles[0].chapter-1;
    let lastItem = usingArticles[usingArticles.length-1].chapter
    console.log(`%c This book begins at chapter: ${countNumber+1} `, 'background: blue; color: white');
    usingArticles.forEach(title => {
             const tmpTitle = title.chapter
             if(tmpTitle !== countNumber+1)
             {
                 if(tmpTitle !== countNumber+0.5)
                 {  
                  console.log(`%c Error at ${tmpTitle} `, 'background: red; color: white');
                  if(tmpTitle !== parseInt(tmpTitle))countNumber+=0.5
                  else countNumber+=1;
                }

             }

             if(tmpTitle !== parseInt(tmpTitle))countNumber+=0.5
             else countNumber+=1;
    })


    console.log(`%c This book ends around chapter: ${lastItem} `, 'background: blue; color: white');

  }

  const downloadFiles = async () => {
    const $body = document.querySelector('body');
    const $head = document.querySelector('head');
    $head.innerHTML = "";
    $body.innerHTML = "";
    var meta = document.createElement('meta');
    meta.name = "author";
    meta.content = "莫默 (MOMO)";
    document.title = "Martial peak";
    const $h1 = document.createElement('h1');
    $h1.textContent = "Martial peak"
    $body.appendChild($h1);

    await articles.forEach(async element => {
        $body.appendChild(element.chapterContent)
    })

    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURI(document.documentElement.outerHTML);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'myFile.html';
    hiddenElement.click();
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
