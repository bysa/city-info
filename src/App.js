import React, { Component } from "react";
import "./App.css";

import { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";

const ListCities = `
  query list {
    listCitys {
      items {
        id name description
      }
    }
  }
`;

const CreateCity = `
  mutation($name: String!, $description: String) {
    createCity(input: {
      name: $name description: $description
    }) {
      id name description
    }
  }
`;

const SubscribeToCities = `
  subscription {
    onCreateCity {
      id name description
    }
  }
`;

class App extends Component {
  state = { cities: [], name: "", description: "" };
  async componentDidMount() {
    const cities = await API.graphql(graphqlOperation(ListCities));
    this.setState({ cities: cities.data.listCitys.items });

    API.graphql(graphqlOperation(SubscribeToCities)).subscribe({
      next: eventData => {
        const city = eventData.value.data.onCreateCity;
        const cities = [
          ...this.state.cities.filter(i => {
            return i.name !== city.name && i.description !== city.description;
          }),
          city
        ];

        this.setState({ cities });
      }
    });
  }
  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  createCity = async () => {
    if (this.state.city === "" || this.state.description === "") return;
    const city = { name: this.state.name, description: this.state.description };
    try {
      const cities = [...this.state.cities, city];
      this.setState({ cities, name: "", description: "" });
      await API.graphql(graphqlOperation(CreateCity, city));
      console.log("success");
    } catch (err) {
      console.log("error", err);
    }
  };

  render() {
    return (
      <div className="App">
        <div style={{ padding: 20, display: "flex", flexDirection: "column" }}>
          <input
            value={this.state.name}
            name="name"
            onChange={this.onChange}
            style={{ height: 35, margin: 10 }}
          />
          <input
            value={this.state.description}
            name="description"
            onChange={this.onChange}
            style={{ height: 35, margin: 10 }}
          />
          <button onClick={this.createCity}>Create City</button>
        </div>
        {this.state.cities.map((c, i) => (
          <div key={i}>
            <h3>{c.name}</h3>
            <p>{c.description}</p>
          </div>
        ))}
      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreeting: true });
// export default App;
