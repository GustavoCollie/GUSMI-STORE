describe('Seed Mock Data', () => {
  it('seeds all entities', () => {
    const ts = Date.now();
    const productIds = [];
    const supplierIds = [];

    cy.login();

    // ── 1. Create 10 products ──
    const products = [
      { name: 'Monitor LED 27"', sku: `MON-${ts}`, description: 'Monitor Full HD 27 pulgadas IPS' },
      { name: 'Teclado Mecánico', sku: `TEC-${ts}`, description: 'Teclado mecánico switches rojos' },
      { name: 'Mouse Inalámbrico', sku: `MOU-${ts}`, description: 'Mouse ergonómico 2.4GHz' },
      { name: 'Resma Papel A4', sku: `PAP-${ts}`, description: 'Resma 500 hojas 75g/m²' },
      { name: 'Carpeta Archivador', sku: `CAR-${ts}`, description: 'Carpeta lomo ancho oficio' },
      { name: 'Detergente Industrial', sku: `DET-${ts}`, description: 'Detergente líquido 5L' },
      { name: 'Desinfectante Multiusos', sku: `DES-${ts}`, description: 'Desinfectante concentrado 1L' },
      { name: 'Taladro Percutor', sku: `TAL-${ts}`, description: 'Taladro percutor 13mm 750W' },
      { name: 'Juego Destornilladores', sku: `JDE-${ts}`, description: 'Set 12 piezas CrV' },
      { name: 'Silla Ergonómica', sku: `SIL-${ts}`, description: 'Silla oficina con soporte lumbar' },
    ];

    const stockQuantities = [150, 80, 120, 200, 90, 60, 75, 40, 100, 30];

    // Create products sequentially and collect IDs
    const createProducts = products.reduce((chain, prod, i) => {
      return chain.then(() => {
        return cy.seedProduct(prod).then((res) => {
          expect(res.status).to.eq(201);
          productIds.push(res.body.id);

          // Add stock
          return cy.apiRequest('POST', `/products/${res.body.id}/receive-stock`, {
            quantity: stockQuantities[i],
            reference: `SEED-STOCK-${i}`,
          }, { form: true }).then((stockRes) => {
            expect(stockRes.status).to.be.oneOf([200, 201]);
          });
        });
      });
    }, cy.wrap(null));

    // ── 2. Create 5 suppliers (each linked to 2 products) ──
    createProducts.then(() => {
      const suppliers = [
        { name: 'TechPro SAC', ruc: '20512345671', email: `techpro-${ts}@test.com`, phone: '014567890', productIndices: [0, 1] },
        { name: 'OfiMax Perú', ruc: '20523456782', email: `ofimax-${ts}@test.com`, phone: '016789012', productIndices: [2, 3] },
        { name: 'CleanCo SAC', ruc: '20534567893', email: `cleanco-${ts}@test.com`, phone: '017890123', productIndices: [4, 5] },
        { name: 'Herramientas del Sur', ruc: '20545678904', email: `herrasur-${ts}@test.com`, phone: '018901234', productIndices: [6, 7] },
        { name: 'Global Supply', ruc: '20556789015', email: `globalsup-${ts}@test.com`, phone: '019012345', productIndices: [8, 9] },
      ];

      return suppliers.reduce((chain, sup) => {
        return chain.then(() => {
          return cy.seedSupplier({
            name: sup.name,
            ruc: sup.ruc,
            email: sup.email,
            phone: sup.phone,
            product_ids: sup.productIndices.map((i) => productIds[i]),
          }).then((res) => {
            expect(res.status).to.eq(201);
            supplierIds.push(res.body.id);
          });
        });
      }, cy.wrap(null));
    }).then(() => {
      // ── 3. Create 10 purchase orders ──
      const purchaseOrders = [
        { supplierIdx: 0, productIdx: 0, quantity: 25, unit_price: 450, currency: 'USD' },
        { supplierIdx: 0, productIdx: 1, quantity: 50, unit_price: 85, currency: 'USD' },
        { supplierIdx: 1, productIdx: 2, quantity: 30, unit_price: 35, currency: 'USD' },
        { supplierIdx: 1, productIdx: 3, quantity: 40, unit_price: 12, currency: 'PEN' },
        { supplierIdx: 2, productIdx: 4, quantity: 20, unit_price: 18, currency: 'PEN' },
        { supplierIdx: 2, productIdx: 5, quantity: 15, unit_price: 45, currency: 'PEN' },
        { supplierIdx: 3, productIdx: 6, quantity: 10, unit_price: 28, currency: 'PEN' },
        { supplierIdx: 3, productIdx: 7, quantity: 5, unit_price: 320, currency: 'USD' },
        { supplierIdx: 4, productIdx: 8, quantity: 35, unit_price: 55, currency: 'USD' },
        { supplierIdx: 4, productIdx: 9, quantity: 10, unit_price: 500, currency: 'USD' },
      ];

      return purchaseOrders.reduce((chain, po) => {
        return chain.then(() => {
          return cy.apiRequest('POST', '/purchasing/orders', {
            supplier_id: supplierIds[po.supplierIdx],
            product_id: productIds[po.productIdx],
            quantity: po.quantity,
            unit_price: po.unit_price,
            currency: po.currency,
          }).then((res) => {
            expect(res.status).to.eq(201);
          });
        });
      }, cy.wrap(null));
    }).then(() => {
      // ── 4. Create 10 sales orders ──
      const customers = [
        { name: 'María García', email: `maria-${ts}@test.com` },
        { name: 'Carlos López', email: `carlos-${ts}@test.com` },
        { name: 'Ana Rodríguez', email: `ana-${ts}@test.com` },
        { name: 'Jorge Ramírez', email: `jorge-${ts}@test.com` },
        { name: 'Lucía Fernández', email: `lucia-${ts}@test.com` },
      ];

      const salesOrders = [
        { custIdx: 0, productIdx: 0, quantity: 3, unit_price: 550, shipping_type: 'DELIVERY', shipping_address: 'Av. Javier Prado 1200, Lima' },
        { custIdx: 0, productIdx: 1, quantity: 5, unit_price: 120, shipping_type: 'PICKUP' },
        { custIdx: 1, productIdx: 2, quantity: 10, unit_price: 50, shipping_type: 'DELIVERY', shipping_address: 'Calle Las Begonias 450, San Isidro' },
        { custIdx: 1, productIdx: 3, quantity: 20, unit_price: 18, shipping_type: 'PICKUP' },
        { custIdx: 2, productIdx: 4, quantity: 8, unit_price: 25, shipping_type: 'DELIVERY', shipping_address: 'Jr. de la Unión 300, Cercado de Lima' },
        { custIdx: 2, productIdx: 5, quantity: 4, unit_price: 65, shipping_type: 'PICKUP' },
        { custIdx: 3, productIdx: 6, quantity: 12, unit_price: 40, shipping_type: 'DELIVERY', shipping_address: 'Av. Arequipa 2500, Miraflores' },
        { custIdx: 3, productIdx: 7, quantity: 1, unit_price: 480, shipping_type: 'PICKUP' },
        { custIdx: 4, productIdx: 8, quantity: 15, unit_price: 75, shipping_type: 'DELIVERY', shipping_address: 'Av. La Marina 1500, San Miguel' },
        { custIdx: 4, productIdx: 9, quantity: 2, unit_price: 650, shipping_type: 'PICKUP' },
      ];

      return salesOrders.reduce((chain, so) => {
        return chain.then(() => {
          const cust = customers[so.custIdx];
          const payload = {
            customer_name: cust.name,
            customer_email: cust.email,
            product_id: productIds[so.productIdx],
            quantity: so.quantity,
            unit_price: so.unit_price,
            shipping_type: so.shipping_type,
          };
          if (so.shipping_address) {
            payload.shipping_address = so.shipping_address;
          }
          return cy.seedSalesOrder(payload).then((res) => {
            expect(res.status).to.eq(201);
          });
        });
      }, cy.wrap(null));
    });
  });
});
