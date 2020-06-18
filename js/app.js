class Model {
  constructor(ads = []) {
    this.ads = ads
    this.filteredAds = ads
    this.selectedRole = null
    this.selectedLevel = null
    this.selectedCategories = []
  }

  addCategory = (category, role = '', level = '') => {

    if (!this.selectedCategories.includes(category) && !role && !level) {
      this.selectedCategories.push(category)
    }

    if (role) this.selectedRole = role

    if (level) this.selectedLevel = level

    console.log(this.selectedRole, this.selectedLevel)

    this.filterAds()
    this._notify()
  }

  deleteCategory = (category, role = '', level = '') => {

    if (!role && !level)
      this.selectedCategories = this.selectedCategories.filter(item => item !== category)

    if (role) this.selectedRole = null

    if (level) this.selectedLevel = null

    this.filterAds()

    this._notify()
  }

  clearCategories = () => {
    this.selectedCategories = []
    this.selectedRole = null
    this.selectedLevel = null

    this._resetFilterAds()

    this._notify()
  }

  filterAds = () => {

    if (this.selectedRole)
      this.filteredAds = this._filterByRole(this.ads)

    if (this.selectedLevel)
      this.filteredAds = this._filterByLevel(this.filteredAds)

    if (this.selectedCategories.length)
      this.filteredAds = this._filterByLanguages(this.filteredAds)

  }

  _filterByRole(ads) {
    return ads.filter(ad => ad.role === this.selectedRole)
  }

  _filterByLevel(ads) {
    return ads.filter(ad => ad.level === this.selectedLevel)
  }

  _filterByLanguages(ads) {
    return ads.filter(ad => this.selectedCategories.every(category => ad.languages.includes(category)))
  }

  _resetFilterAds = () => {
    this.filteredAds = this.ads
  }

  _notify = () => {
    this.onAdListChange(this.filteredAds)
    this.onCategoriesChange(this.selectedCategories, this.selectedRole, this.selectedLevel)
  }

  bindCategoriesChange = (callback) => {
    this.onCategoriesChange = callback
  }

  bindAdListChange(callback) {
    this.onAdListChange = callback
  }

}

class View {
  constructor() {
    //The root element
    this.app = this.getElement('#app')
    this.adList = this.getElement('.ad-list')
    this.categoriesList = this.getElement('.header .categories')
  }

  createElement = (tag, className) => {
    const element = document.createElement(tag)
    if (className) element.classList.add(className)

    return element
  }

  getElement = (selector) => {
    const element = document.querySelector(selector)

    return element
  }

  _createChip = (text, hasDeleteButton) => {
    const chip = this.createElement('span', 'chip')
    const link = this.createElement('a', 'chip__body')
    const button = this.createElement('button', 'chip__append')
    const img = this.createElement('img', 'chip__icon')
    img.src = "images/icon-remove.svg"

    button.append(img)

    link.textContent = text
    link.href = "#"

    chip.append(link)

    if (hasDeleteButton) {
      chip.append(button)
    }

    return chip
  }

  _createDetails = (ad) => {
    const details = this.createElement('div', 'ad__details')

    const tags = this.createElement('div', 'ad__tags')
    const companyTag = this.createElement('span', 'ad__tag')
    const newTag = this.createElement('span', 'ad__tag')
    const featureTag = this.createElement('span', 'ad__tag')

    const position = this.createElement('a', 'ad__role')
    const info = this.createElement('ul', 'ad__info')

    const postedAt = this.createElement('li', 'ad__info-item')
    const contract = this.createElement('li', 'ad__info-item')
    const location = this.createElement('li', 'ad__info-item')

    //Setting ad tags
    companyTag.textContent = ad.company
    companyTag.classList.add('ad__tag--company')

    newTag.textContent = 'new!'
    newTag.classList.add('ad__tag--new')

    featureTag.textContent = 'featured'
    featureTag.classList.add('ad__tag--featured')

    //Appending tags
    tags.append(companyTag)
    if (ad.new) tags.append(newTag)
    if (ad.featured) tags.append(featureTag)

    //Setting ad position
    position.textContent = ad.position
    position.href = '#'

    //Setting ad info
    postedAt.textContent = ad.postedAt
    contract.textContent = ad.contract
    location.textContent = ad.location

    info.append(postedAt, contract, location)

    details.append(tags, position, info)

    return details
  }

  _createCategories = (ad) => {
    const {
      role,
      level,
      languages
    } = ad

    const categories = this.createElement('div', 'categories')

    const chip__role = this._createChip(role, false)
    const chip__level = this._createChip(level, false)

    chip__role.dataset.role = role
    chip__level.dataset.level = level

    categories.append(chip__role)
    categories.append(chip__level)

    languages.forEach(language => {
      const chip = this._createChip(language, false)

      categories.append(chip)
    })

    return categories
  }

  _createAd = (ad) => {
    const article = this.createElement('article', 'ad')
    const logo = this.createElement('img', 'ad__company-logo')

    const details = this._createDetails(ad)

    const categories = this._createCategories(ad)

    //Setting ad logo
    logo.src = ad.logo
    logo.alt = 'Company Logo'

    if (ad.featured) article.classList.add('ad--featured')

    //Appeding elements to the article
    article.append(logo, details, categories)

    return article
  }

  _createCategory = (text, role, level) => {
    const chip = this._createChip(text, true)

    if (role) chip.dataset.role = role
    if (level) chip.dataset.level = level

    return chip
  }

  displayAds = (ads) => {
    this._emptyAdList()

    ads.forEach(ad => {
      const $ad = this._createAd(ad)

      this.adList.append($ad)
    })
  }

  displayCategories = (categories, role, level) => {
    let $category = null

    this._emptyCategoriesList()

    if (role) {
      $category = this._createCategory(role)

      $category.dataset.role = role

      this.categoriesList.append($category)
    }

    if (level) {
      $category = this._createCategory(level)

      $category.dataset.level = level

      this.categoriesList.append($category)
    }

    categories.forEach(category => {
      const $category = this._createCategory(category)

      this.categoriesList.append($category)
    })

  }


  bindAddCategory = (handler) => {
    const chips = Array.from(document.querySelectorAll('.ad .chip'))

    chips.forEach(chip => {
      chip.addEventListener('click', (event) => {
        event.preventDefault()

        const {
          role,
          level
        } = event.target.parentElement.dataset

        handler(event.target.textContent, role, level)
      })
    })
  }

  bindDeleteCategory = (handler) => {
    const chipButtons = Array.from(document.querySelectorAll('.chips-container .chip__append'))

    chipButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault()

        const {
          role,
          level
        } = event.target.parentElement.parentElement.dataset

        console.log(role, level, event.target.parentElement.previousSibling.textContent)

        handler(event.target.parentElement.previousSibling.textContent, role, level)
      })
    })
  }

  bindClearCategories = (handler) => {
    const clearButton = document.querySelector('.header .btn')

    clearButton.addEventListener('click', (event) => {
      event.preventDefault()
      handler()
    })
  }

  _emptyAdList = () => {
    let child = this.adList.firstChild

    while (child) {
      this.adList.removeChild(child)

      child = this.adList.firstChild
    }
  }

  _emptyCategoriesList = () => {
    let child = this.categoriesList.firstChild

    while (child) {
      this.categoriesList.removeChild(child)

      child = this.categoriesList.firstChild
    }
  }
}

class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view

    this.onAdListChange(this.model.filteredAds)
    this.onCategoriesChange(this.model.selectedCategories)

    this.bindHandlers()
  }

  bindHandlers = () => {
    this.model.bindAdListChange(this.onAdListChange)
    this.model.bindCategoriesChange(this.onCategoriesChange)
  }

  onAdListChange = (ads) => {
    this.view.displayAds(ads)
  }

  onCategoriesChange = (categories, role, level) => {
    this.view.displayCategories(categories, role, level)
    this.view.bindAddCategory(this.handleAddCategory)
    this.view.bindDeleteCategory(this.handleDeleteCategory)
    this.view.bindClearCategories(this.handleClearCategories)
  }

  handleAddCategory = (category, role, level) => {
    this.model.addCategory(category, role, level)
  }

  handleDeleteCategory = (category, role, level) => {
    this.model.deleteCategory(category, role, level)
  }

  handleClearCategories = () => {
    this.model.clearCategories()
  }
}

const loadJSON = new Promise((resolve) => {
  let xObj = new XMLHttpRequest();

  xObj.overrideMimeType("application/json");

  xObj.open('GET', 'data.json', true);

  xObj.onreadystatechange = function () {
    if (xObj.readyState == 4 && xObj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      resolve(xObj.responseText);
    }
  };

  xObj.send(null);
})


loadJSON.then(data => {
  const ads = JSON.parse(data)
  const model = new Model(ads)
  const view = new View()
  const app = new Controller(model, view)
})