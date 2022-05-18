const head = document.querySelector('head')
const body = document.querySelector('body')

// mocha CSS link
const mochaCSSPath = "https://cdnjs.cloudflare.com/ajax/libs/mocha/8.3.2/mocha.min.css"
const mochaCSSLinkEl = document.createElement('link')
mochaCSSLinkEl.rel = 'stylesheet'
mochaCSSLinkEl.href = mochaCSSPath
head.prepend(mochaCSSLinkEl)

// custom styles for mocha runner
const mochaStyleEl = document.createElement('style')
mochaStyleEl.innerHTML =
  `#mocha {
    font-family: sans-serif;
    position: fixed;
    overflow-y: auto;
    z-index: 1000;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 48px 0 96px;
    background: white;
    color: black;
    display: none;
    margin: 0;
  }
  #mocha * {
    letter-spacing: normal;
    text-align: left;
  }
  #mocha .replay {
    pointer-events: none;
  }
  #mocha-test-btn {
    position: fixed;
    bottom: 50px;
    right: 50px;
    z-index: 1001;
    background-color: #007147;
    border: #009960 2px solid;
    color: white;
    font-size: initial;
    border-radius: 4px;
    padding: 12px 24px;
    transition: 200ms;
    cursor: pointer;
  }
  #mocha-test-btn:hover:not(:disabled) {
    background-color: #009960;
  }
  #mocha-test-btn:disabled {
    background-color: grey;
    border-color: grey;
    cursor: initial;
    opacity: 0.7;
  }`
head.appendChild(mochaStyleEl)

// mocha div
const mochaDiv = document.createElement('div')
mochaDiv.id = 'mocha'
body.appendChild(mochaDiv)

// run tests button
const testBtn = document.createElement('button')
testBtn.textContent = "Loading Tests"
testBtn.id = 'mocha-test-btn'
testBtn.disabled = true
body.appendChild(testBtn)

const scriptPaths = [
  "https://cdnjs.cloudflare.com/ajax/libs/mocha/8.3.2/mocha.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/chai/4.3.4/chai.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/sinon.js/10.0.1/sinon.min.js",
  // "jsdom.js" // npx browserify _jsdom.js --standalone JSDOM -o jsdom.js
]
const scriptTags = scriptPaths.map(path => {
  const scriptTag = document.createElement('script')
  scriptTag.type = 'text/javascript'
  scriptTag.src = path
  return scriptTag
})

let loaded = 0
if (localStorage.getItem('test-run')) {
  // lazy load test dependencies
  scriptTags.forEach(tag => {
    body.appendChild(tag)
    tag.onload = function () {
      if (loaded !== scriptTags.length - 1) {
        loaded++
        return
      }
      testBtn.textContent = 'Run Tests'
      testBtn.disabled = false
      testBtn.onclick = __handleClick
      runTests()
    }
  })
} else {
  testBtn.textContent = 'Run Tests'
  testBtn.disabled = false
  testBtn.onclick = __handleClick
}

function __handleClick() {
  if (!localStorage.getItem('test-run') && this.textContent === 'Run Tests') {
    localStorage.setItem('test-run', true)
  } else {
    localStorage.removeItem('test-run')
  }
  window.location.reload()
}

function runTests() {
  testBtn.textContent = 'Running Tests'
  testBtn.disabled = true
  mochaDiv.style.display = 'block'
  body.style.overflow = 'hidden'

  mocha.setup("bdd");
  const expect = chai.expect;

  describe("Dice Roll Practice", function () {
    let rollBtn = document.querySelector('button')
    let promptStub
    let alertStub
    let confirmStub
    let randomStub
    const stubRandom = num => {
      if (randomStub) randomStub.restore()
      randomStub = sinon.stub(Math, 'random').returns(num)
    }
    const stubPrompt = str => {
      if (promptStub) promptStub.restore()
      promptStub = sinon.stub(window, 'prompt').returns(str)
    }
    const stubConfirm = bool => {
      if (confirmStub) confirmStub.restore()
      confirmStub = sinon.stub(window, 'confirm')
      confirmStub.onFirstCall().returns(bool)
      confirmStub.onSecondCall().returns(false)
    }
    beforeEach(() => {
      alertStub = sinon.stub(window, 'alert')
      stubPrompt('6')
      stubConfirm(false)
      stubRandom(0)
    })
    afterEach(sinon.restore)
    after(() => {
      testBtn.disabled = false
      testBtn.textContent = 'Close Tests'
    })
    it('should have a roll button', () => {
      expect(rollBtn).to.exist
      expect(rollBtn).to.not.eq(testBtn)
      expect(rollBtn.textContent.toLowerCase())
        .to.include('roll')
    })
    it('should prompt for how many sided die to roll', () => {
      rollBtn.click()
      expect(promptStub.called).to.be.true
      expect(promptStub.firstCall.args[0]).to.exist
      expect(promptStub.firstCall.args[0].toLowerCase())
        .to.include('side')
    })
    it('should alert with number result of dice roll', () => {
      rollBtn.click()
      expect(alertStub.called).to.be.true
      expect(alertStub.firstCall.args[0].match(/\d/))
        .to.exist
    })
    it('should roll between 1 and amount of sides of die', () => {
      rollBtn.click()
      expect(alertStub.called).to.be.true
      expect(alertStub.firstCall.args[0])
        .to.include('1')

      stubRandom(0.99)

      rollBtn.click()
      expect(alertStub.secondCall.args[0])
        .to.include('6')
    })
    it('should exit the function and not roll if a non-number is given', () => {
      stubPrompt('banana')
      rollBtn.click()
      expect(alertStub.called).to.be.false
    })
    it('should exit the function and not roll if user cancels prompt', () => {
      stubPrompt(null)
      rollBtn.click()
      expect(alertStub.called).to.be.false
    })
    it('BONUS: should ask to roll again', () => {
      rollBtn.click()
      expect(confirmStub.called).to.be.true
      expect(confirmStub.firstCall.args[0])
        .to.include('roll again')
    })
    it('BONUS: rolling again should call the function again', () => {
      stubConfirm(true)
      rollBtn.click()
      expect(confirmStub.calledTwice).to.be.true
      expect(alertStub.calledTwice).to.be.true
      expect(promptStub.calledTwice).to.be.true
    })
  });

  mocha.run();
}