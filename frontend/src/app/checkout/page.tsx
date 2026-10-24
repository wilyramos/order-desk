import CheckoutForm from "@/components/CheckoutForm";

export default function CheckoutPage() {
  return (
    <main className="bg-white px-6 py-24 text-[#1d1d1f]">
      <h1 className="mb-14 text-center text-5xl font-semibold tracking-tight md:text-6xl">
        Finalizar compra
      </h1>
      <CheckoutForm />
    </main>
  );
}