"use client";
import { useState } from "react";
import SearchForm from "./Components/SearchForm";
import ProductList from "./Components/ProductList";
import { saveAs } from "file-saver";
import { exportToShopifyCsv } from "@/lib/csvExporter";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const baseURL = "https://products-three-xi.vercel.app/"

  const handleSearch = async (searchTerms) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchTerm: searchTerms }),
      });
      console.log(response.data ? response.data : `No data found`);
      
      if (response.status === 400) {
        setStatus("Ack! We were unable to find results for your prompt :(");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Search failed:", error);
    }
    setLoading(false);
  };

  const handleAddProduct = (product) => {
    setSelectedProducts([...selectedProducts, product]);
  };

  const handleExport = () => {
    const csv = exportToShopifyCsv(selectedProducts);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "selected_products.csv");
  };

  const handleRemoveProduct = (productToRemove) => {
    setSelectedProducts(prevSelected => 
      prevSelected.filter(product => product.url !== productToRemove.url)
    );
  };

  return (
    <div className="container mx-auto p-4">
           <br />
      <h1 className="text-2xl font-bold mb-4">AliExpress Product Finder</h1>
      {/* <Link href={"/download"} style={{ margin: "40px" }}>
        Tiktok Scraping
      </Link> */}

      {/* <Link href={"/tttt"} style={{ margin: "40px" }}>
        Tiktok Scraper
      </Link> */}
      <br />
      {/* <Link href={"/calendar"} style={{ margin: "40px" }}>
        Open Calendar
      </Link>
      <Link href={"/voice"}>Ai voice generation</Link> */}
      <br />
      <SearchForm onSearch={handleSearch} />
      <br />
      {loading ? (
        <p>Searching for winning products...</p>
      ) : (
        <ProductList
          products={products}
          selectedProducts={selectedProducts}
          onAddProduct={handleAddProduct}
          onExport={handleExport}
          onClearSelected={() => setSelectedProducts([])}
          onRemoveProduct={handleRemoveProduct}
        />
      )}
      <h1>{status}</h1>
    </div>
  );
}
