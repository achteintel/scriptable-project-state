// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: chart-bar;
const projectSlug = "achteintel-litfassmuseum"
const url = "https://wemakeit.com/projects/" + projectSlug + ".xml"
const locale = "de"
const request = new Request(url)
let response = await request.loadString()
let elementName = ""
let currentValue = null
let title = null
let items = []
let currentItem = null
const xmlParser = new XMLParser(response)
const widget = new ListWidget()

xmlParser.didStartElement = name => {
  currentValue = ""
  
  if (name == "project") {
    currentItem = {}
  }
}

xmlParser.didEndElement = name => {
  const hasItem = currentItem != null
  if (hasItem && name == "currency") {
    currentItem["currency"] = currentValue
  }
  if (hasItem && name == locale && title == null) {
    currentItem["projectName"] = currentValue
    title = currentValue
  }
  if (hasItem && name == "goal") {
    currentItem["goal"] = parseInt(currentValue, 10)
  }
  if (hasItem && name == "pledged-amount") {
    currentItem["pledgedAmount"] = parseInt(currentValue,10)
  }
  if (hasItem && name == "ended-at") {
    currentItem["endedAt"] = currentValue
  }
  if (hasItem && name == "backers-count") {
    currentItem["backersCount"] = parseInt(currentValue,10)
  }
  if (name == "project") {
    items.push(currentItem)
    currentItem = {}
  }
}

xmlParser.foundCharacters = str => {
  currentValue += str
}

xmlParser.didEndDocument = () => {
  let backers = null
  let percentReached = null
  let amountReached = null
  let textToSpeak = null
  let localeAppendix = null
  let numberLocale = null
  
  for (item of items) {
    backers = item.backersCount + " Unterstützer*innen"
    percentReached = item.pledgedAmount / item.goal * 100 + "%"
    
    if (item.currency == 'EUR') {
      localeAppendix = 'DE'
    } else {
      localeAppendix = 'CH'
    }
      
    numberLocale = locale + '-' + localeAppendix
    
    amountReached = new Intl.NumberFormat(numberLocale, {style: 'currency', currency: item.currency }).format(item.pledgedAmount)
  }
  
  textToSpeak = "Dein Projekt hat " + percentReached + " mit der Hilfe von " + backers + " erreicht, das sind " + amountReached

  QuickLook.present(textToSpeak)
  
  if (config.runsWithSiri) {
    Speech.speak(textToSpeak)
  }
}

xmlParser.parse()
