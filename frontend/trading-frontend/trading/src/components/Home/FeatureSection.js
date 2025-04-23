import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { TrendingUp, Shield, Users, BarChart3 } from "lucide-react";
import "../../styles/Features.css";

const FeaturesSection = () => {
  const features = [
    {
      icon: <TrendingUp size={48} color="#0d6efd" />,
      title: "Advanced Trading",
      description:
        "Access professional-grade trading tools and real-time market data.",
    },
    {
      icon: <Shield size={48} color="#198754" />,
      title: "Secure Platform",
      description:
        "Your assets are protected by industry-leading security measures.",
    },
    {
      icon: <Users size={48} color="#6f42c1" />,
      title: "24/7 Support",
      description: "Our expert team is always available to help you succeed.",
    },
    {
      icon: <BarChart3 size={48} color="#dc3545" />,
      title: "Market Insights",
      description:
        "Get AI-powered market analysis to make informed trading decisions.",
    },
  ];

  return (
    <section className="py-5 bg-light">
      <Container>
        <h2 className="text-center mb-5">Our Features</h2>
        <div
          className="justify-content-center g-4"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          {features.map((feature, index) => (
            <Col key={index} xs={12} sm={6} lg={3}>
              <Card className="h-100 shadow-sm text-center p-3 hover-shadow">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="mb-3">{feature.icon}</div>
                  <Card.Title>{feature.title}</Card.Title>
                  <Card.Text>{feature.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FeaturesSection;
