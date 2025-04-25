import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const CardList = ({
  userId,
  onSelectCard,
  selectedCard,
  setSelectedCard,
  setForm,
  setCardType,
}) => {
  const [cards, setCards] = useState([]);
  const [savedCards, setSavedCards] = useState([]);

  // Fetch saved cards from backend
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/payment/cards/${userId}`
        );
        setCards(response.data);
        setSavedCards(response.data);
      } catch (error) {
        console.error("Error fetching cards", error);
        Swal.fire("Error", "Failed to fetch cards", "error");
      }
    };

    if (userId) {
      fetchCards();
    }
  }, [userId]);

  // Handle card deletion
  const handleDelete = async (cardId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this card? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `http://localhost:8080/api/payment/deleteCard/${cardId}`
        );
        setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
        setSavedCards((prevCards) =>
          prevCards.filter((card) => card.id !== cardId)
        );

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The card has been deleted successfully.",
        });

        // Reset selected card and form if the deleted card was selected
        if (selectedCard && selectedCard.id === cardId) {
          setSelectedCard(null);
          setForm({
            cardNumber: "",
            expiry: "",
            cvv: "",
            cardHolder: "",
          });
          setCardType("");
        }
      } catch (error) {
        console.error("Error deleting card", error);
        Swal.fire({
          icon: "error",
          title: "Failed to Delete Card",
          text: "There was an issue deleting the card.",
        });
      }
    }
  };

  if (cards.length === 0) {
    return (
      <div className="alert alert-info">No cards saved. Please add a card.</div>
    );
  }

  return (
    <div className="card-list">
      <h5 className="mb-4">Saved Cards</h5>
      <div className="list-group">
        {cards.map((card) => (
          <div key={card.id} className="list-group-item">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6>
                  {card.cardType.charAt(0).toUpperCase() +
                    card.cardType.slice(1)}
                </h6>
                <small className="text-secondary">
                  **** **** **** {card.cardNumber.slice(-4)}
                </small>
                {card.cardHolder && <div>Holder: {card.cardHolder}</div>}
              </div>
              <div>
                {onSelectCard && (
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => onSelectCard(card)}
                  >
                    Use
                  </button>
                )}
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(card.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardList;
