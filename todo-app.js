/** @jsx TinyReact.createElement */

/*** Step 1,2,3,4 - createElement */

const root = document.getElementById("root");

var Step1 = (
  <div>
    <h1 className="header">Hello Tiny React!</h1>
    <h2>(coding nirvana)</h2>
    <div>nested 1<div>nested 1.1</div></div>
    <h3>(OBSERVE: This will change)</h3>
    {2 == 1 && <div>Render this if 2==1</div>}
    {2 == 2 && <div>{2}</div>}
    <span>This is a text</span>
    <button onClick={() => alert("Hi!")}>Click me!</button>
    <h3>This will be deleted</h3>
    2,3
  </div>
);

var Step2 = (
  <div>
    <h1 className="header">Hello Tiny React!</h1>
    <h2>(coding nirvana)</h2>
    <div>nested 1<div>nested 1.1</div></div>
    <h3 style="background-color:yellow">(OBSERVE: I said it!!)</h3>
    {2 == 1 && <div>Render this if 2==1</div>}
    {2 == 2 && <div>{2}</div>}
    <span>Something goes here...</span>
    <button onClick={() => alert("This has changed!")}>Click me!</button>
  </div>
);

// console.log(Step1);
// console.log(Step2);
// TinyReact.render(Step1, root);

// setTimeout(() => {
//   alert("rerendering");
//   TinyReact.render(Step2, root);
// }, 4000);


const Heart = (props) => <span style={props.style}>&hearts;</span>;

//console.log(Heart);

// TinyReact.render(<Heart style="color:red; width:100%" />, root);

const Button = (props) => <button onClick={props.onClick}>{props.children}</button>;

const Greeting = function (props) {
  return (
    <div className="greeting">
      <h2>Welcome {props.message}</h2>
      <Button onClick={() => alert("I love React")}>I <Heart /> React</Button>
    </div>
  );
}

// console.log(Greeting);

// TinyReact.render(<Greeting message="Good day!" />, root);

// setTimeout(() => {
//   alert("Re-rendering...");
//   TinyReact.render(<Greeting message="Good Night!" />, root);
// }, 4000);


class Alert extends TinyReact.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Default title"
    };

    this.changeTitle = this.changeTitle.bind(this);
  }

  changeTitle() {
    this.setState({ title: new Date().toString() });
  }

  render() {
    return (
      <div className="alert-container">
        <h2>{this.state.title}</h2>
        <div>
          {this.props.message}
        </div>
        <Button onClick={this.changeTitle}>Change title</Button>
      </div>
    );
  }
}

// console.log(Alert);

//TinyReact.render(<Alert message="Hi....!" />, root);

class Stateful extends TinyReact.Component {
  constructor(props) {
    super(props);
    console.log(props);
  }
  render() {
    return (
      <div>
        <h2>{this.props.title.toString()}</h2>
        <button onClick={update}>Update</button>
      </div>
    );
  }
}


function update() {
  TinyReact.render(<Stateful title={new Date()} />, root);
}

//TinyReact.render(<Stateful title="Task 1" />, root);

class WishList extends TinyReact.Component {
  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
    this.state = {
      wish: {
        title: "I want to be an doctor!"
      }
    }
  }

  update() {
    let newWish = this.inputWish.value;

    let wish = Object.assign({}, this.state.wish);

    wish.title = newWish;

    this.setState({
      wish
    })
  }

  render() {
    return (
      <div>
        <h2>Your Wish List</h2>
        <h3>{this.state.wish.title}</h3>
        <input type="text" ref={(inputWish) => { this.inputWish = inputWish }} placeholder="your wish list" />
        <button onClick={this.update}>Update</button>
      </div>
    )
  }
}


TinyReact.render(<WishList />, root);







