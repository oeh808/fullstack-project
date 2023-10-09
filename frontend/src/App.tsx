import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import SignIn from "./components/SignIn";

function App() {
  // let items = ["Apple", "Mango", "Strawberry"];

  // const handleSelectedItem = (item: string) => {
  //   console.log(item);
  // };

  return (
    <div className="App">
      {/* <ListGroup
        items={items}
        heading="fruits"
        onSelectItem={handleSelectedItem}
      /> */}
      <header className="App-header">
        <SignIn></SignIn>
      </header>
    </div>
  );
}

export default App;
