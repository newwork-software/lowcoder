import { getUser } from "redux/selectors/usersSelectors";
import React, { useEffect } from 'react';
import { useSelector } from "react-redux";
import styled from "styled-components";
import { GreyTextColor } from "constants/style";
import { trans } from "i18n";
import { Level1SettingPageContent, Level1SettingPageTitle } from "../styled";
import { Flex } from 'antd';
import { ProductCard } from "./productCard";
import SubscriptionApi, {Customer} from "@lowcoder-ee/api/subscriptionApi";

const SubscriptionSettingContent = styled.div`
  max-width: 840px;

  .section-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .section-content {
    margin-bottom: 28px;
  }

  .section-option {
    color: ${GreyTextColor};
    margin-bottom: 14px;
    font-size: 13px;
  }

`;

const lcHeaders = {
  "Lowcoder-Token": "96a99c7b-3758-4c48-b4b1-a8cbf59e7d6c",
  "Content-Type": "application/json"
};

interface Pricing {
  type: string;
  amount: string;
}

interface Product {
  title: string;
  description: string;
  image: string;
  pricingType: string;
  pricing: Pricing[];
  activeSubscription: boolean;
  accessLink: string;
}


export function SubscriptionSetting() {
  const user = useSelector(getUser);
  const userId = user.id;
  const orgID = user.currentOrgId;
  const domain = window.location.hostname;
  const admin = user.orgDev;

  const subscriptionCustomer: Customer = {
    hostname: domain,
    email: "contact@example.com",
    orgId: orgID,
    userId: userId,
    userName: user.username,
    type: "org",
    companyName: "Example Company",
    /* address: {
      line1: "123 Example Street",
      line2: "Suite 456",
      city: "Malaga",
      state: "Andalusia",
      country: "Spain",
      postalCode: "12345"
    } */
  };

  const createCustomer = async (subscriptionCustomer : Customer) => {
    const apiBody = {
      path: "webhook/secure/create-customer",
      data: subscriptionCustomer,
      method: "post",
      headers: lcHeaders
    }
    try {
      const result = await SubscriptionApi.secureRequest(apiBody);
      if (result) {
        console.log("createCustomer", result);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const searchCustomer = async (subscriptionCustomer : Customer) => {
    const apiBody = {
      path: "webhook/secure/search-customer", 
      data: subscriptionCustomer,
      method: "post",
      headers: lcHeaders
    }
    try {
      const result = await SubscriptionApi.secureRequest(apiBody);
      if (result) {
        if (result.data.data.length === 0) {
          console.log("searchCustomer", "Zero results");
        }
        else {
          console.log("searchCustomer", result.data.data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const products: Product[] = [
    {
      title: "Support Subscription",
      description: "Support Ticket System and SLAs to guarantee response time and your project success.",
      image: "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png",
      pricingType: "Monthly, per User",
      pricing: [
        { type: "User", amount: "$3.49 (user, month)" },
        { type: "> 10 Users", amount: "$2.49 (user, month)" },
        { type: "> 100 Users", amount: "$1.49 (user, month)" }
      ],
      activeSubscription: true,
      accessLink: "QW8L3WPMiNjQjI",
    },
    {
      title: "Azure API Package Subscription",
      description: "Access to all features.",
      image: "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png",
      pricingType: "Monthly, per User",
      pricing: [
        { type: "Volume Price", amount: "$20/month" },
        { type: "Single Price", amount: "$25/month" }
      ],
      activeSubscription: false,
      accessLink: "QW8OwsM2Gm8mVF",
    }
  ];

  useEffect(() => {
    // Call searchCustomer as soon as the component mounts
    searchCustomer(subscriptionCustomer);
  }, []);

  return (
    <Level1SettingPageContent>
      <Level1SettingPageTitle>
        {trans("settings.subscription")}
      </Level1SettingPageTitle>
      <SubscriptionSettingContent>
      <a onClick={(event) => createCustomer(subscriptionCustomer)}>Create Customer</a>
        <Flex wrap='wrap' gap="large">
          {products.map((product, index) => (
            <ProductCard
              key={index}
              title={product.title}
              description={product.description}
              image={product.image}
              pricingType={product.pricingType}
              pricing={product.pricing}
              activeSubscription={product.activeSubscription}
              accessLink={product.accessLink}
            />
          ))}
        </Flex>
      </SubscriptionSettingContent>
    </Level1SettingPageContent>
  );
}

