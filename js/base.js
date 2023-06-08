const tabs = document.querySelectorAll('.nav-menu li');
const tabInfo = {
    pokemons: {
        endpoint: 'pokemon',
        sprite: 'front_shiny'
    },
    berries: {
        endpoint: 'berry',
        sprite: null
    },
    items: {
        endpoint: 'item',
        sprite: 'default'
    },
};

const openedCard = document.querySelector('.openedCard');


for (let tab of tabs) {
    tab.addEventListener('click', () => {
        // swicth tab
        let activeTab = switchActive('.nav-menu .active', tab);
        let tabName = tab.innerText.toLowerCase();

        if (!activeTab) return null;

        // switch article
        let needAritcle = document.querySelector(`article.${tabName}`);
        let activeArticle = switchActive('article.active', needAritcle, true);

        
        let currentTab = tabInfo[tabName]; 

        sendRequest(`https://pokeapi.co/api/v2/${currentTab.endpoint}`)
        .then(data => {
            for (let item of data.results) {
                sendRequest(item.url)
                .then(itemInfo => {
                    let newCardInfo = {
                        id: itemInfo.id,
                        name: itemInfo.name
                    };

                    if (currentTab.sprite) newCardInfo['image'] = itemInfo.sprites[currentTab.sprite];


                    let newCard = activeArticle.appendChild(createCard(newCardInfo));
                    let button = newCard.querySelector('.open');
                    button.addEventListener('click', openCard);
                })
            }
        });
    })
}



const defaultTab = document.querySelector('.nav-menu .default');
defaultTab.click();



function openCard(pointEvent) {
    let self = pointEvent.target;
    let card = self.parentNode;

    let activeTab = document.querySelector('.nav-menu .active');
    let endpoint = tabInfo[activeTab.innerText.toLowerCase()].endpoint;

    let neededData = [];
    let sprite;

    switch (endpoint) {
        case 'pokemon': {
            neededData = ['height', 'weight', 'base_experience'];
            sprite = 'front_shiny';
            break;
        }
        case 'berry': {
            neededData = ['growth_time', 'max_harvest', 'natural_gift_power', 'size', 'smoothness', 'soil_dryness'];
            break;
        }
        case 'item': {
            neededData = ['cost', 'short_effect'];
            sprite = 'default';
            break;
        }
    }

    sendRequest(`https://pokeapi.co/api/v2/${endpoint}/${card.id}`)
    .then(data => {
        let inner = `<h1>${data.name}</h1><div><div class="info">`;

        for (let item of neededData) {
            let value = data[item];
            
            if (item == 'short_effect') {
                inner += '<br>' + data['effect_entries'][0][item].replaceAll('\n', '<br>');
                continue;
            }

            if (value) inner += `<p>${item}: ${value}</p>`;
        };

        inner += sprite ? `</div><div class="image" style="background-image: url(${data.sprites[sprite]});"></div>` : '</div>';

        inner += '</div><button class="close">close</button>';

        openedCard.innerHTML = inner;

        let closeBtn = openedCard.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            openedCard.innerHTML = '';
            switchCardVisibility();
        })

        switchCardVisibility();
    })
}


function switchCardVisibility () {
    let wrapper = document.querySelector('.wrapper');
    
    document.body.classList.toggle('hidden');
    wrapper.classList.toggle('active');
    openedCard.classList.toggle('active');
}


function switchActive(selector, self, needClear = false) {
    let activeItem = document.querySelector(selector);

    if (activeItem == self) return null;

    if (activeItem) {
        activeItem.classList.toggle('active');
        if (needClear) setTimeout(() => {activeItem.innerHTML = ''}, 250);
    }

    self.classList.toggle('active');

    return self;
}


function createCard(info) {
    let div = document.createElement('div');
    let inner = '';
    
    if (info.image) inner += `<div class="image" style="background-image: url(${info.image});"></div>`;
    if (info.name) inner += `<h3 class="title">${info.name}</h3>`;
    
    inner += '<button class="open">check it</button>'

    div.innerHTML = inner;
    div.setAttribute('id', info.id)

    return div;
}


function sendRequest(url, method = 'GET') {
    let data = fetch(url, { method })
    .then(response => response.json())
    .catch(error => console.error(error));

    return data;
}