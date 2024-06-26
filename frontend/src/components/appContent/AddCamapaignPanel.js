import React, { useState, useEffect } from "react";
import Select from "react-select";
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from "axios";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import "./appContent.css";

const AddCampaignPage = () => {
  const [user, setUser] = useState({ username: '', balance: '' });
  const [keywords, setKeywords] = useState([]);
  const [cities, setCities] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({ id: '', name: '' });
  const [campaign, setCampaign] = useState({
    name: '',
    keywords: [],
    product: {
      id: '',
      name: ''
    },
    bidAmount: '1',
    fund: '',
    status: 'ON',
    city: {
      id: '',
      name: '',
    },
    radius: '',
    accountId: '' 
  });
  const { productId } = useParams();
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      const token = Cookies.get("accessTokenFront"); 
      console.log("Access Token:", token); 

      if (!token) {
        console.error("No token, can't get data.");
        return;
      }

      const userResponse = await axios.get(
        `http://localhost:8090/api/user/current`, 
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      console.log("User API Response:", userResponse.data);
      const userData = {
        username: userResponse.data.username,
        balance: userResponse.data.balance
      };
      setUser(userData);

      const productNameResponse = await axios.get(
        `http://localhost:8090/api/campaigns/product/${productId}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      console.log("Product name API Response:", productNameResponse.data);
      const productNameData = {
        id: productNameResponse.data.id,
        name: productNameResponse.data.name
      };
      setCurrentProduct(productNameData);


      const citiesResponse = await axios.get(
        `http://localhost:8090/api/campaigns/cities`, 
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      console.log("Cities API Response:", citiesResponse.data);
      const citiesData = citiesResponse.data.map((city) => ({
        value: city.id,
        label: city.name,
      }));
      setCities(citiesData);


      const keywordsResponse = await axios.get(
        `http://localhost:8090/api/campaigns/keywords`, 
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      console.log("Keywords API Response:", keywordsResponse.data);
      const keywordsData = keywordsResponse.data.map((keyword) => ({
        value: keyword.id,
        label: keyword.name,
      }));
      setKeywords(keywordsData);
      
      setCampaign((prevCampaign) => ({
        ...prevCampaign,
        product: {
          id: productId
        },
        accountId: userResponse.data.id
      }));
    
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productId]);

  
  useEffect(() => {
    setCampaign((prevCampaign) => ({
      ...prevCampaign,
      accountId: user.id
    }));
  }, [user.id]);

  const onInputChange = (e) => {
    setCampaign({ ...campaign, [e.target.name]: e.target.value });
  };

  const onKeywordsChange = (selectedOptions) => {
    setCampaign({
      ...campaign,
      keywords: selectedOptions.map(option => ({
        id: option.value,
        name: option.label
      }))
    });
  };

  const onCityChange = (selectedOption) => {
    setCampaign({
      ...campaign,
      city: {
        id: selectedOption.value,
        name: selectedOption.label
      }
    });
  }

  const handleStatusChange = () => {
    const newStatus = campaign.status === 'ON' ? 'OFF' : 'ON'; 
    setCampaign({ ...campaign, status: newStatus });
  };

  const validateFunds = () => {
    return campaign.fund <= user.balance;
  };  

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateFunds()) {
      console.error("Insufficient funds.");
      alert("You do not have enough funds to create this campaign.");
      return;
    }
  
    try {
      const token = Cookies.get("accessTokenFront");
  
      if (!token) {
        console.error("No token, can't send data.");
        return;
      }
  
      // Aktualizacja balansu użytkownika
      const newBalance = user.balance - campaign.fund;
      const userData = {
        username: user.username,
        balance: newBalance
      };
      setUser(userData);
  
      // Aktualizacja salda
      await axios.put(
        `http://localhost:8090/api/user/current/balance`,
        {
          username: user.username,
          balance: newBalance
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Wysyłanie danych kampanii
      await axios.post(
        `http://localhost:8090/api/campaigns/products/${productId}/add`,
        campaign,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Pokaż okno modalne po pomyślnym zakończeniu żądania POST
      setShowModal(true);

      // Ponowne pobranie danych po zapisaniu kampanii
      fetchData();
  
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };
  

  return (
    <div className="AppContent">
      <div className="container-fluid">
        <div className="d-flex flex-column align-items-center">
          <div className="col-md-4">
            <div className="py-3">
              <table className="table border shadow">
                <thead>
                  <tr>
                    <th scope="col">Username</th>
                    <th scope="col">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <i>
                        <b>{user.username}</b>
                      </i>
                    </td>
                    <td>{user.balance}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="campaign-list shadow">
          <div className="col-md-12">
            <div className="py-2">
              <h2 className="text-center mb-4">Add campaign</h2>
              
              <form onSubmit={onSubmit}>
                <div className="col-md-4 mx-auto">
                  <label htmlFor="Name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Name of campaign"
                    name="name"
                    required
                    value={campaign.name}
                    onChange={(e) => onInputChange(e)}
                  />
                </div>
                
                <div className="col-md-4 mx-auto">
                  <label htmlFor="products">Product</label>
                  <input
                    id="products"
                    name="products"
                    options={currentProduct}
                    value={currentProduct.name}
                    placeholder={productId}
                    readOnly
                    className="form-control"
                  />
                </div>

                <div className="col-md-4 mx-auto">
                  <label htmlFor="keywords">Keywords</label>
                  <Select
                    id="keywords"
                    name="keywords"
                    options={keywords}
                    onChange={onKeywordsChange}
                    value={campaign.keywords.map(keyword => ({
                      value: keyword.id,
                      label: keyword.name
                    }))}
                    placeholder="Select keywords"
                    isSearchable
                    isClearable
                    required
                    isMulti
                    onInvalid={(e) => {
                      e.target.setCustomValidity("Select keywords");
                    }}
                    onBlur={(e) => {
                      e.target.setCustomValidity("");
                    }}
                    styles={{
                      control: (provided) => ({ ...provided, textAlign: "left" }),
                    }}
                  />
                </div>

                <div className="col-md-4 mx-auto">
                  <label htmlFor="city">City</label>
                  <Select
                    id="city"
                    name="city"
                    options={cities}
                    onChange={onCityChange}
                    value={cities.find(option => option.label === campaign.city)}
                    placeholder="Select city"
                    isSearchable
                    isClearable
                    required
                    onInvalid={(e) => {
                      e.target.setCustomValidity("Select city");
                    }}
                    onBlur={(e) => {
                      e.target.setCustomValidity("");
                    }}
                    styles={{
                      control: provided => ({ ...provided, textAlign: "left" })
                    }}
                  />
                </div>

                <div className="col-md-4 mx-auto">
                  <label htmlFor="Radius" className="form-label">
                    Radius
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter Radius"
                    name="radius"
                    required
                    min="0"
                    value={campaign.radius}
                    onChange={(e) => onInputChange(e)}
                  />
                </div>

                <div className="col-md-4 mx-auto">
                  <label htmlFor="Fund" className="form-label">
                    Fund
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter Fund"
                    name="fund"
                    required
                    min="1"
                    value={campaign.fund}
                    onChange={(e) => onInputChange(e)}
                  />
                </div>

                <div className="col-md-4 mx-auto">
                  <label htmlFor="BidAmount" className="form-label">
                    Bid Amount
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter Bid Amount"
                    name="bidAmount"
                    required
                    min="1"
                    value={campaign.bidAmount}
                    onChange={(e) => onInputChange(e)}
                  />
                </div>

                <div className="col-md-4 mx-auto">
                  <Form.Group controlId="statusSwitch" className="my-3">
                    <Form.Check
                      type="switch"
                      id="statusSwitch"
                      label={`Status: ${campaign.status}`}
                      checked={campaign.status === "ON"}
                      onChange={handleStatusChange}
                    />
                  </Form.Group>
                </div>
                <div className="mt-4"></div>
                  <div className="text-center">
                    <button type="submit" className="btn btn-primary">
                      Submit
                    </button>
                  </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>Campaign added successfully!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddCampaignPage;
