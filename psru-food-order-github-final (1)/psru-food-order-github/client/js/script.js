// Mock Data: Stalls / Food Shops in PSRU_FoodOrder
        const SHOPS = [
            {
                id: 'shop1',
                name: 'ร้านก๋วยเตี๋ยวเรือรสเด็ด',
                category: 'ก๋วยเตี๋ยว / เกาเหลา',
                desc: 'เข้มข้น รสชาติแท้ วัตถุดิบสดใหม่ ทำสดใหม่ทุกจาน',
                menu: [
                    { id: 'm101', name: 'ก๋วยเตี๋ยวเรือเนื้อเปื่อย', price: 60, category: 'ก๋วยเตี๋ยว', desc: 'เนื้อเปื่อยหมักสูตรเด็ด น้ำซุปเข้มข้น', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=60' },
                    { id: 'm102', name: 'ก๋วยเตี๋ยวเรือหมูสไลด์', price: 55, category: 'ก๋วยเตี๋ยว', desc: 'หมูนุ่มสไลด์ ตับ นกกระทา', image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&auto=format&fit=crop&q=60' },
                    { id: 'm103', name: 'เกาเหลาเนื้อรวมพิเศษ', price: 75, category: 'เกาเหลา', desc: 'เนื้อเปื่อย เอ็น ลูกชิ้น ครบเครื่อง', image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=400&auto=format&fit=crop&q=60' },
                    { id: 'm104', name: 'เกี๊ยวกรอบทอดกรอบ', price: 25, category: 'ทานเล่น', desc: 'เกี๊ยวทอดกรอบเสิร์ฟพร้อมน้ำจิ้มบ๊วย', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=60' },
                    { id: 'm105', name: 'กากหมูเจียวกรอบ', price: 20, category: 'ทานเล่น', desc: 'กากหมูทอดใหม่ หอมกรอบเคี้ยวเพลิน', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&auto=format&fit=crop&q=60' }
                ]
            },
            {
                id: 'shop2',
                name: 'ครัวป้าทอง อาหารตามสั่ง',
                category: 'อาหารตามสั่ง / ข้าวผัด',
                desc: 'เมนูผัดกะเพรา ราดข้าว เสิร์ฟร้อน รวดเร็วทันใจ',
                menu: [
                    { id: 'm201', name: 'ข้าวผัดกะเพราหมูกรอบ + ไข่ดาว', price: 65, category: 'จานด่วน', desc: 'หมูกรอบแท้ ผัดกะเพรารสจัดจ้าน', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=60' },
                    { id: 'm202', name: 'ข้าวผัดต้มยำทะเล', price: 70, category: 'จานด่วน', desc: 'กุ้ง หมึก ต้มยำแห้งหอมสมุนไพร', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&auto=format&fit=crop&q=60' },
                    { id: 'm203', name: 'ข้าวคะน้าหมูกรอบ', price: 60, category: 'จานด่วน', desc: 'คะน้าต้นอ่อน ผัดไฟแดงหมูกรอบ', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&auto=format&fit=crop&q=60' },
                    { id: 'm204', name: 'ต้มยำกุ้งน้ำข้น (ถ้วย)', price: 120, category: 'กับข้าว', desc: 'กุ้งแม่น้ำตัวใหญ่ น้ำซุปต้มยำเข้มข้น', image: 'https://images.unsplash.com/photo-1548946526-f69e2424cf45?w=400&auto=format&fit=crop&q=60' }
                ]
            }
        ];

        // Global State variables for PSRU_FoodOrder
        let currentUser = {
            name: '',
            phone: '',
            role: 'customer' // 'customer' or 'merchant'
        };

        let currentShopId = 'shop1';
        let merchantShopId = 'shop1';
        let activeCategory = 'ทั้งหมด';
        let cart = []; // [{ id, name, price, qty, note }]
        let orders = []; // List of all order objects
        let editingOrder = null; // Order object currently being edited
        let activeTab = 'menu'; // 'menu' or 'queue'
        let merchantFilter = 'all';
        let isSoundEnabled = true;

        // Broadcast Channel for Real-time Cross-Tab Sync (PSRU_FoodOrder channel)
        const broadcast = new BroadcastChannel('psru_foodorder_channel');

        // Web Audio API Sound Synthesizer (No external mp3 needed)
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        function playSound(type) {
            if (!isSoundEnabled) return;
            try {
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);

                if (type === 'bell') {
                    // Pleasant chime / bell sound
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
                    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // A5
                    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
                    osc.start(audioCtx.currentTime);
                    osc.stop(audioCtx.currentTime + 0.6);
                } else if (type === 'success') {
                    // Success sound sequence
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
                    osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
                    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
                    osc.start(audioCtx.currentTime);
                    osc.stop(audioCtx.currentTime + 0.5);
                } else if (type === 'cancel') {
                    // Lower pitched cancel tone
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.3);
                    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                    osc.start(audioCtx.currentTime);
                    osc.stop(audioCtx.currentTime + 0.3);
                }
            } catch (e) {
                console.log('Audio playback error:', e);
            }
        }

        function toggleSound() {
            isSoundEnabled = !isSoundEnabled;
            const icon = document.getElementById('soundIcon');
            const badge = document.getElementById('soundBadge');
            if (isSoundEnabled) {
                icon.className = 'fa-solid fa-bell text-lg text-slate-700';
                badge.className = 'absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full';
                showToast('เปิดเสียงแจ้งเตือนแล้ว', 'info');
                playSound('bell');
            } else {
                icon.className = 'fa-solid fa-bell-slash text-lg text-slate-400';
                badge.className = 'hidden';
                showToast('ปิดเสียงแจ้งเตือนแล้ว', 'info');
            }
        }

        // Load & Save State to LocalStorage
        function loadStateFromStorage() {
            try {
                const storedUser = localStorage.getItem('psru_user');
                if (storedUser) currentUser = JSON.parse(storedUser);

                const storedOrders = localStorage.getItem('psru_orders');
                if (storedOrders) orders = JSON.parse(storedOrders);

                const storedCart = localStorage.getItem('psru_cart');
                if (storedCart) cart = JSON.parse(storedCart);
            } catch (e) {
                console.error("Error loading storage:", e);
            }
        }

        function saveOrdersToStorage() {
            localStorage.setItem('psru_orders', JSON.stringify(orders));
            // Broadcast change to other tabs
            broadcast.postMessage({ type: 'SYNC_ORDERS', orders: orders });
        }

        function saveCartToStorage() {
            localStorage.setItem('psru_cart', JSON.stringify(cart));
            updateCartUI();
        }

        // Listen for Broadcast messages from other tabs
        broadcast.onmessage = (event) => {
            if (event.data && event.data.type === 'SYNC_ORDERS') {
                orders = event.data.orders;
                renderAppUI();
                playSound('bell');
            }
        };

        // Window LocalStorage event listener fallback
        window.addEventListener('storage', (e) => {
            if (e.key === 'psru_orders' && e.newValue) {
                orders = JSON.parse(e.newValue);
                renderAppUI();
            }
        });

        // Initialize App
        window.onload = function() {
            loadStateFromStorage();
            populateShopSelectors();

            if (!currentUser.name) {
                openRoleModal();
            } else {
                updateHeaderUserDisplay();
                renderAppUI();
            }
        };

        function updateHeaderUserDisplay() {
            const userInfoEl = document.getElementById('headerUserInfo');
            const roleBtnLabel = document.getElementById('roleBtnLabel');
            if (currentUser.name) {
                userInfoEl.textContent = `${currentUser.name} (${currentUser.role === 'merchant' ? 'แม่ค้า' : 'ลูกค้า'})`;
                roleBtnLabel.textContent = `บทบาท: ${currentUser.role === 'merchant' ? 'แม่ค้า' : 'ลูกค้า'}`;
            }
        }

        function populateShopSelectors() {
            const shopSelect = document.getElementById('shopSelect');
            const merchantShopSelect = document.getElementById('merchantShopSelect');
            
            shopSelect.innerHTML = SHOPS.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            merchantShopSelect.innerHTML = SHOPS.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

            shopSelect.value = currentShopId;
            merchantShopSelect.value = merchantShopId;
        }

        function openRoleModal() {
            const modal = document.getElementById('roleModal');
            document.getElementById('userInputName').value = currentUser.name || '';
            document.getElementById('userInputPhone').value = currentUser.phone || '';
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.children[0].classList.remove('scale-95');
            modal.children[0].classList.add('scale-100');
        }

        function closeRoleModal() {
            const modal = document.getElementById('roleModal');
            modal.classList.add('opacity-0', 'pointer-events-none');
            modal.children[0].classList.remove('scale-100');
            modal.children[0].classList.add('scale-95');
        }

        function setRoleAndLogin(role) {
            const name = document.getElementById('userInputName').value.trim();
            const phone = document.getElementById('userInputPhone').value.trim();

            if (!name) {
                showToast('กรุณากรอกชื่อผู้ใช้งาน', 'error');
                return;
            }

            currentUser = { name, phone, role };
            localStorage.setItem('psru_user', JSON.stringify(currentUser));
            updateHeaderUserDisplay();
            closeRoleModal();

            showToast(`ยินดีต้อนรับคุณ ${name} สู่ PSRU_FoodOrder (${role === 'merchant' ? 'ร้านค้า/แม่ค้า' : 'ลูกค้า'})`, 'success');
            renderAppUI();
        }

        function renderAppUI() {
            const custView = document.getElementById('customerView');
            const merchView = document.getElementById('merchantView');

            if (currentUser.role === 'merchant') {
                custView.classList.add('hidden');
                merchView.classList.remove('hidden');
                renderMerchantOrders();
            } else {
                merchView.classList.add('hidden');
                custView.classList.remove('hidden');
                if (activeTab === 'menu') {
                    renderShopAndMenu();
                } else {
                    renderCustomerQueue();
                }
                updateCartUI();
                updateActiveQueueBadge();
            }
        }

        function switchTab(tab) {
            activeTab = tab;
            const menuBtn = document.getElementById('tabMenuBtn');
            const queueBtn = document.getElementById('tabQueueBtn');
            const menuContent = document.getElementById('menuTabContent');
            const queueContent = document.getElementById('queueTabContent');
            const shopSelectorContainer = document.getElementById('shopSelectorContainer');

            if (tab === 'menu') {
                menuBtn.className = 'px-4 py-2.5 rounded-xl font-kanit font-medium text-sm flex items-center gap-2 transition-all bg-orange-500 text-white shadow-md shadow-orange-500/20';
                queueBtn.className = 'px-4 py-2.5 rounded-xl font-kanit font-medium text-sm flex items-center gap-2 transition-all bg-slate-100 text-slate-600 hover:bg-slate-200';
                menuContent.classList.remove('hidden');
                queueContent.classList.add('hidden');
                shopSelectorContainer.classList.remove('hidden');
                renderShopAndMenu();
            } else {
                queueBtn.className = 'px-4 py-2.5 rounded-xl font-kanit font-medium text-sm flex items-center gap-2 transition-all bg-orange-500 text-white shadow-md shadow-orange-500/20';
                menuBtn.className = 'px-4 py-2.5 rounded-xl font-kanit font-medium text-sm flex items-center gap-2 transition-all bg-slate-100 text-slate-600 hover:bg-slate-200';
                queueContent.classList.remove('hidden');
                menuContent.classList.add('hidden');
                shopSelectorContainer.classList.add('hidden');
                renderCustomerQueue();
            }
        }

        function changeShop(shopId) {
            currentShopId = shopId;
            activeCategory = 'ทั้งหมด';
            cart = []; // reset cart for new shop
            saveCartToStorage();
            renderShopAndMenu();
        }

        function renderShopAndMenu() {
            const shop = SHOPS.find(s => s.id === currentShopId) || SHOPS[0];
            
            // Update Shop Banner Info
            document.getElementById('shopCategoryText').textContent = shop.category;
            document.getElementById('shopTitleText').textContent = shop.name;
            document.getElementById('shopDescText').textContent = shop.desc;

            // Categories Filter Buttons
            const categories = ['ทั้งหมด', ...new Set(shop.menu.map(m => m.category))];
            const catContainer = document.getElementById('categoryFilterButtons');
            catContainer.innerHTML = categories.map(cat => `
                <button onclick="setMenuCategory('${cat}')" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }">
                    ${cat}
                </button>
            `).join('');

            // Filter Menu Items
            const filteredMenu = activeCategory === 'ทั้งหมด' 
                ? shop.menu 
                : shop.menu.filter(m => m.category === activeCategory);

            const grid = document.getElementById('menuItemsGrid');
            grid.innerHTML = filteredMenu.map(item => {
                const inCartItem = cart.find(c => c.id === item.id);
                const qty = inCartItem ? inCartItem.qty : 0;

                return `
                <div class="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col group">
                    <div class="relative h-40 bg-slate-100 overflow-hidden">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='https://placehold.co/400x300/f97316/ffffff?text=${encodeURIComponent(item.name)}'">
                        <span class="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white font-kanit font-bold text-xs px-2.5 py-1 rounded-full shadow">
                            ฿${item.price}
                        </span>
                    </div>
                    <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                            <h3 class="font-kanit font-bold text-slate-800 text-base leading-snug">${item.name}</h3>
                            <p class="text-xs text-slate-500 mt-1 line-clamp-2">${item.desc}</p>
                        </div>
                        <div class="flex items-center justify-between pt-2">
                            ${qty > 0 ? `
                                <div class="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-1">
                                    <button onclick="updateCartQty('${item.id}', -1)" class="w-7 h-7 rounded-lg bg-white text-orange-600 shadow-sm flex items-center justify-center font-bold text-sm hover:bg-orange-100">
                                        <i class="fa-solid fa-minus text-xs"></i>
                                    </button>
                                    <span class="font-kanit font-bold text-slate-800 text-sm px-1">${qty}</span>
                                    <button onclick="updateCartQty('${item.id}', 1)" class="w-7 h-7 rounded-lg bg-orange-500 text-white shadow-sm flex items-center justify-center font-bold text-sm hover:bg-orange-600">
                                        <i class="fa-solid fa-plus text-xs"></i>
                                    </button>
                                </div>
                            ` : `
                                <button onclick="addToCart('${item.id}')" class="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-kanit font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-orange-200">
                                    <i class="fa-solid fa-plus text-xs"></i>
                                    <span>เพิ่มลงตะกร้า</span>
                                </button>
                            `}
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        }

        function setMenuCategory(cat) {
            activeCategory = cat;
            renderShopAndMenu();
        }

        function addToCart(itemId) {
            const shop = SHOPS.find(s => s.id === currentShopId);
            const menuItem = shop.menu.find(m => m.id === itemId);
            if (!menuItem) return;

            const existing = cart.find(c => c.id === itemId);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({
                    id: menuItem.id,
                    name: menuItem.name,
                    price: menuItem.price,
                    qty: 1,
                    note: ''
                });
            }
            saveCartToStorage();
            renderShopAndMenu();
            playSound('bell');
        }

        function updateCartQty(itemId, delta) {
            const idx = cart.findIndex(c => c.id === itemId);
            if (idx !== -1) {
                cart[idx].qty += delta;
                if (cart[idx].qty <= 0) {
                    cart.splice(idx, 1);
                }
            }
            saveCartToStorage();
            renderShopAndMenu();
        }

        function updateCartUI() {
            const cartBar = document.getElementById('floatingCartBar');
            const cartCountBadge = document.getElementById('cartCountBadge');
            const cartTotalPrice = document.getElementById('cartTotalPrice');

            const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
            const totalSum = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

            cartCountBadge.textContent = totalItems;
            cartTotalPrice.textContent = `฿${totalSum}`;

            if (totalItems > 0 && activeTab === 'menu' && currentUser.role === 'customer') {
                cartBar.classList.remove('translate-y-28', 'opacity-0', 'pointer-events-none');
            } else {
                cartBar.classList.add('translate-y-28', 'opacity-0', 'pointer-events-none');
            }
        }

        function openCartModal() {
            if (cart.length === 0) return;
            const modal = document.getElementById('cartModal');
            renderCartModalItems();
            
            // Set default estimated pickup time (+15 mins)
            const now = new Date();
            now.setMinutes(now.getMinutes() + 15);
            const timeStr = now.toTimeString().substring(0, 5);
            document.getElementById('cartPickupTime').value = timeStr;

            modal.classList.remove('opacity-0', 'pointer-events-none');
        }

        function closeCartModal() {
            const modal = document.getElementById('cartModal');
            modal.classList.add('opacity-0', 'pointer-events-none');
        }

        function renderCartModalItems() {
            const container = document.getElementById('cartItemsContainer');
            const totalEl = document.getElementById('cartModalTotal');

            let totalSum = 0;
            container.innerHTML = cart.map((item, index) => {
                const itemTotal = item.price * item.qty;
                totalSum += itemTotal;
                return `
                <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 space-y-2">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-kanit font-bold text-slate-800 text-sm">${item.name}</span>
                            <div class="text-xs text-orange-600 font-semibold">฿${item.price} × ${item.qty} = ฿${itemTotal}</div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="updateCartQty('${item.id}', -1); renderCartModalItems();" class="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-600 flex items-center justify-center font-bold text-xs hover:bg-slate-100">
                                <i class="fa-solid fa-minus"></i>
                            </button>
                            <span class="font-kanit font-bold text-sm w-4 text-center">${item.qty}</span>
                            <button onclick="updateCartQty('${item.id}', 1); renderCartModalItems();" class="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs hover:bg-orange-600">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div>
                        <input type="text" placeholder="ระบุตัวเลือกเพิ่มเติม (เช่น เผ็ดมาก, ไม่ผัก)" value="${item.note || ''}" onchange="updateCartItemNote(${index}, this.value)" class="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-300 bg-white focus:ring-1 focus:ring-orange-500 outline-none">
                    </div>
                </div>
                `;
            }).join('');

            totalEl.textContent = `฿${totalSum}`;
        }

        function updateCartItemNote(index, value) {
            if (cart[index]) {
                cart[index].note = value;
                saveCartToStorage();
            }
        }

        function submitCustomerOrder() {
            if (cart.length === 0) return;

            if (!currentUser.name) {
                openRoleModal();
                return;
            }

            const pickupType = document.getElementById('cartPickupType').value;
            const pickupTime = document.getElementById('cartPickupTime').value;
            const note = document.getElementById('cartOrderNote').value.trim();

            const shop = SHOPS.find(s => s.id === currentShopId);

            // Generate Queue ID
            const shopOrdersToday = orders.filter(o => o.shopId === currentShopId);
            const queueNum = (shopOrdersToday.length + 1).toString().padStart(3, '0');
            const queueNo = `Q-${queueNum}`;

            const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

            const newOrder = {
                id: 'ORD-' + Date.now(),
                queueNo: queueNo,
                customerName: currentUser.name,
                customerPhone: currentUser.phone,
                shopId: currentShopId,
                shopName: shop.name,
                items: [...cart],
                pickupType: pickupType,
                pickupTime: pickupTime,
                note: note,
                totalPrice: totalPrice,
                status: 'pending', // 'pending', 'cooking', 'ready', 'completed', 'cancelled'
                estMinutes: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            orders.unshift(newOrder);
            saveOrdersToStorage();

            // Clear Cart
            cart = [];
            saveCartToStorage();
            closeCartModal();

            showToast(`สั่งอาหารสำเร็จ! หมายเลขคิว PSRU_FoodOrder คือ ${queueNo}`, 'success');
            playSound('success');

            // Switch to queue tab
            switchTab('queue');
        }

        function renderCustomerQueue() {
            const container = document.getElementById('customerQueueList');
            const myOrders = orders.filter(o => o.customerName === currentUser.name && !o.hiddenForCustomer);

            updateActiveQueueBadge();

            if (myOrders.length === 0) {
                container.innerHTML = `
                <div class="bg-white rounded-3xl p-8 text-center border border-slate-200/80 space-y-3">
                    <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto text-2xl">
                        <i class="fa-solid fa-receipt"></i>
                    </div>
                    <h3 class="font-kanit font-bold text-slate-700 text-lg">ยังไม่มีรายการคิวของคุณ</h3>
                    <p class="text-xs text-slate-500 max-w-sm mx-auto">เลือกสั่งอาหารอร่อยจากร้านค้าใน PSRU_FoodOrder เพื่อเริ่มจองคิวออนไลน์ได้ทันที</p>
                    <button onclick="switchTab('menu')" class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-kanit font-semibold rounded-xl text-xs transition-all shadow-md">
                        ไปเลือกสั่งอาหาร
                    </button>
                </div>
                `;
                return;
            }

            container.innerHTML = myOrders.map(order => {
                const statusBadge = getStatusBadgeHTML(order.status);
                const isPending = order.status === 'pending';
                const isCompletedOrCancelled = order.status === 'completed' || order.status === 'cancelled';

                // Calculate Queue Position if pending
                let queuePositionText = '';
                if (isPending) {
                    const shopPending = orders.filter(o => o.shopId === order.shopId && o.status === 'pending');
                    const pos = shopPending.findIndex(o => o.id === order.id) + 1;
                    queuePositionText = `รออีก ${pos - 1} คิวก่อนหน้า (คิวที่ ${pos})`;
                }

                return `
                <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 space-y-4">
                    <!-- Queue Top Header -->
                    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div class="flex items-center gap-3">
                            <div class="px-3 py-1.5 bg-slate-900 text-orange-400 font-kanit font-extrabold text-lg rounded-2xl shadow-sm tracking-wide">
                                ${order.queueNo}
                            </div>
                            <div>
                                <h4 class="font-kanit font-bold text-slate-800 text-base leading-tight">${order.shopName}</h4>
                                <div class="text-[11px] text-slate-500">สั่งเมื่อ: ${new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</div>
                            </div>
                        </div>
                        <div>
                            ${statusBadge}
                        </div>
                    </div>

                    <!-- Preparation Time Estimate Banner if Cooking -->
                    ${order.status === 'cooking' && order.estMinutes ? `
                        <div class="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs animate-pulse-slow">
                            <span class="font-medium"><i class="fa-solid fa-spinner fa-spin mr-1.5 text-blue-600"></i> กำลังปรุงอาหารโดยร้านค้า</span>
                            <span class="font-bold font-kanit text-blue-700 bg-white px-2.5 py-1 rounded-xl border border-blue-200">ประมาณ ${order.estMinutes} นาที</span>
                        </div>
                    ` : ''}

                    ${order.status === 'ready' ? `
                        <div class="bg-emerald-500 text-white px-4 py-3 rounded-2xl flex items-center justify-between text-xs shadow-lg shadow-emerald-500/20">
                            <span class="font-bold text-sm"><i class="fa-solid fa-bell-concierge mr-2"></i> อาหารพร้อมรับแล้ว! กรุณามารับที่หน้าร้าน</span>
                            <span class="bg-white text-emerald-700 font-bold px-2 py-1 rounded-lg">รับคิว #${order.queueNo}</span>
                        </div>
                    ` : ''}

                    <!-- Items Summary -->
                    <div class="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                        <div class="font-semibold text-slate-700 mb-1 flex justify-between">
                            <span>รายการอาหารที่สั่ง:</span>
                            <span>${order.pickupType === 'dine-in' ? '🍽️ ทานที่ร้าน' : '🛍 รับกลับบ้าน'} (${order.pickupTime || 'ไม่ระบุ'})</span>
                        </div>
                        ${order.items.map(item => `
                            <div class="flex justify-between text-slate-600">
                                <span>- ${item.name} x ${item.qty} ${item.note ? `<span class="text-orange-600 font-medium">(${item.note})</span>` : ''}</span>
                                <span class="font-medium">฿${item.price * item.qty}</span>
                            </div>
                        `).join('')}

                        ${order.note ? `
                            <div class="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 mt-1">
                                <span class="font-semibold">หมายเหตุ:</span> ${order.note}
                            </div>
                        ` : ''}

                        <div class="flex justify-between text-sm font-bold font-kanit text-slate-800 pt-2 border-t border-slate-200 mt-2">
                            <span>ราคารวมทั้งสิ้น:</span>
                            <span class="text-orange-600">฿${order.totalPrice}</span>
                        </div>
                    </div>

                    ${isPending ? `
                        <div class="text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/60 flex items-center justify-between">
                            <span><i class="fa-solid fa-clock mr-1"></i> ${queuePositionText}</span>
                            <span>สถานะ: รอร้านค้ารับออเดอร์</span>
                        </div>
                    ` : ''}

                    <!-- Action Buttons: EDIT & CANCEL for Customer -->
                    <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        ${isPending ? `
                            <!-- EDIT ORDER BUTTON -->
                            <button onclick="openEditOrderModal('${order.id}')" class="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-kanit font-semibold text-xs border border-blue-200 transition-all flex items-center gap-1.5 active:scale-95">
                                <i class="fa-solid fa-pen-to-square"></i>
                                <span>แก้ไขออเดอร์</span>
                            </button>
                            
                            <!-- CANCEL ORDER BUTTON -->
                            <button onclick="promptCancelOrder('${order.id}')" class="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-kanit font-semibold text-xs border border-red-200 transition-all flex items-center gap-1.5 active:scale-95">
                                <i class="fa-solid fa-xmark"></i>
                                <span>ยกเลิกออเดอร์</span>
                            </button>
                        ` : ''}

                        ${isCompletedOrCancelled ? `
                            <!-- DISMISS / DELETE FROM HISTORY BUTTON -->
                            <button onclick="promptHideOrderFromCustomer('${order.id}')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-kanit font-medium text-xs transition-all flex items-center gap-1">
                                <i class="fa-solid fa-trash-can text-slate-400"></i>
                                <span>ลบออกจากรายการ</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
                `;
            }).join('');
        }

        function updateActiveQueueBadge() {
            const badge = document.getElementById('activeQueueBadge');
            const activeCount = orders.filter(o => o.customerName === currentUser.name && (o.status === 'pending' || o.status === 'cooking' || o.status === 'ready')).length;

            if (activeCount > 0) {
                badge.textContent = activeCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }

        function getStatusBadgeHTML(status) {
            switch(status) {
                case 'pending':
                    return `<span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1"><i class="fa-solid fa-hourglass-start"></i> รอรับออเดอร์</span>`;
                case 'cooking':
                    return `<span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1"><i class="fa-solid fa-fire fa-spin"></i> กำลังปรุงอาหาร</span>`;
                case 'ready':
                    return `<span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md flex items-center gap-1 animate-bounce"><i class="fa-solid fa-check"></i> พร้อมรับอาหาร</span>`;
                case 'completed':
                    return `<span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> เสร็จสิ้นแล้ว</span>`;
                case 'cancelled':
                    return `<span class="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300 flex items-center gap-1"><i class="fa-solid fa-ban"></i> ยกเลิกแล้ว</span>`;
                default:
                    return '';
            }
        }

        function openEditOrderModal(orderId) {
            const order = orders.find(o => o.id === orderId);
            if (!order || order.status !== 'pending') {
                showToast('ออเดอร์นี้เริ่มทำแล้ว ไม่สามารถแก้ไขได้', 'error');
                return;
            }

            // Create a deep copy for editing state
            editingOrder = JSON.parse(JSON.stringify(order));

            document.getElementById('editOrderQueueLabel').textContent = `หมายเลขคิว ${editingOrder.queueNo} (${editingOrder.shopName})`;
            document.getElementById('editPickupType').value = editingOrder.pickupType || 'dine-in';
            document.getElementById('editPickupTime').value = editingOrder.pickupTime || '';
            document.getElementById('editOrderNote').value = editingOrder.note || '';

            renderEditOrderModalItems();

            const modal = document.getElementById('editOrderModal');
            modal.classList.remove('opacity-0', 'pointer-events-none');
        }

        function closeEditOrderModal() {
            editingOrder = null;
            const modal = document.getElementById('editOrderModal');
            modal.classList.add('opacity-0', 'pointer-events-none');
        }

        function renderEditOrderModalItems() {
            if (!editingOrder) return;

            const container = document.getElementById('editOrderItemsContainer');
            const totalEl = document.getElementById('editModalTotal');

            let grandTotal = 0;

            container.innerHTML = editingOrder.items.map((item, idx) => {
                const lineTotal = item.price * item.qty;
                grandTotal += lineTotal;

                return `
                <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-kanit font-bold text-slate-800 text-sm">${item.name}</span>
                            <div class="text-xs text-blue-600 font-semibold">฿${item.price} × ${item.qty} = ฿${lineTotal}</div>
                        </div>
                        <div class="flex items-center gap-2">
                            <!-- Remove Item Button if items > 1 -->
                            <button onclick="removeEditItem(${idx})" class="p-1.5 text-slate-400 hover:text-red-500 transition-colors mr-1" title="ลบรายการนี้">
                                <i class="fa-solid fa-trash-can text-sm"></i>
                            </button>
                            <button onclick="changeEditItemQty(${idx}, -1)" class="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-600 flex items-center justify-center font-bold text-xs hover:bg-slate-100">
                                <i class="fa-solid fa-minus"></i>
                            </button>
                            <span class="font-kanit font-bold text-sm w-4 text-center">${item.qty}</span>
                            <button onclick="changeEditItemQty(${idx}, 1)" class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs hover:bg-blue-700">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div>
                        <input type="text" placeholder="ระบุตัวเลือกเพิ่มเติม (เช่น เผ็ดน้อย)" value="${item.note || ''}" onchange="updateEditItemNote(${idx}, this.value)" class="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 outline-none">
                    </div>
                </div>
                `;
            }).join('');

            editingOrder.totalPrice = grandTotal;
            totalEl.textContent = `฿${grandTotal}`;
        }

        function changeEditItemQty(index, delta) {
            if (!editingOrder) return;
            editingOrder.items[index].qty += delta;
            if (editingOrder.items[index].qty <= 0) {
                if (editingOrder.items.length > 1) {
                    editingOrder.items.splice(index, 1);
                } else {
                    editingOrder.items[index].qty = 1;
                    showToast('ออเดอร์ต้องมีอย่างน้อย 1 รายการอาหาร', 'info');
                }
            }
            renderEditOrderModalItems();
        }

        function removeEditItem(index) {
            if (!editingOrder) return;
            if (editingOrder.items.length <= 1) {
                showToast('ออเดอร์ต้องมีอย่างน้อย 1 รายการอาหาร', 'info');
                return;
            }
            editingOrder.items.splice(index, 1);
            renderEditOrderModalItems();
        }

        function updateEditItemNote(index, val) {
            if (editingOrder && editingOrder.items[index]) {
                editingOrder.items[index].note = val;
            }
        }

        function saveOrderEdits() {
            if (!editingOrder) return;

            if (editingOrder.items.length === 0) {
                showToast('ต้องมีอย่างน้อย 1 รายการอาหารในออเดอร์', 'error');
                return;
            }

            const targetIdx = orders.findIndex(o => o.id === editingOrder.id);
            if (targetIdx === -1) return;

            // Check if status changed in background
            if (orders[targetIdx].status !== 'pending') {
                showToast('ร้านค้ารับออเดอร์แล้ว ไม่สามารถแก้ไขได้', 'error');
                closeEditOrderModal();
                return;
            }

            editingOrder.pickupType = document.getElementById('editPickupType').value;
            editingOrder.pickupTime = document.getElementById('editPickupTime').value;
            editingOrder.note = document.getElementById('editOrderNote').value.trim();
            editingOrder.updatedAt = new Date().toISOString();

            // Save updated order
            orders[targetIdx] = editingOrder;
            saveOrdersToStorage();

            closeEditOrderModal();
            renderCustomerQueue();
            showToast('อัปเดตแก้ไขออเดอร์เรียบร้อยแล้ว!', 'success');
            playSound('success');
        }

        // Cancel Order Handler
        function promptCancelOrder(orderId) {
            const order = orders.find(o => o.id === orderId);
            if (!order) return;

            showConfirmModal(
                `ยกเลิกออเดอร์ ${order.queueNo}?`,
                `คุณต้องการยกเลิกคำสั่งซื้อนี้ใช่หรือไม่? การยกเลิกไม่สามารถย้อนกลับได้`,
                () => {
                    cancelOrder(orderId);
                }
            );
        }

        function cancelOrder(orderId) {
            const idx = orders.findIndex(o => o.id === orderId);
            if (idx !== -1) {
                if (orders[idx].status !== 'pending') {
                    showToast('ออเดอร์นี้ร้านค้ากำลังเริ่มทำ ไม่สามารถยกเลิกได้', 'error');
                    return;
                }
                orders[idx].status = 'cancelled';
                orders[idx].updatedAt = new Date().toISOString();
                saveOrdersToStorage();
                renderCustomerQueue();
                showToast(`ยกเลิกออเดอร์ ${orders[idx].queueNo} เรียบร้อยแล้ว`, 'info');
                playSound('cancel');
            }
        }

        // Hide completed/cancelled order from Customer history
        function promptHideOrderFromCustomer(orderId) {
            showConfirmModal(
                'ลบออกจากรายการ?',
                'คุณต้องการลบประวัติคิวนี้ออกจากหน้าจอของคุณใช่หรือไม่?',
                () => {
                    const idx = orders.findIndex(o => o.id === orderId);
                    if (idx !== -1) {
                        orders[idx].hiddenForCustomer = true;
                        saveOrdersToStorage();
                        renderCustomerQueue();
                        showToast('ลบรายการออกจากหน้าจอเรียบร้อยแล้ว', 'info');
                    }
                }
            );
        }

        // Custom Modal Confirm Dialog Helper
        let onConfirmAction = null;

        function showConfirmModal(title, message, callback) {
            document.getElementById('confirmTitle').textContent = title;
            document.getElementById('confirmMessage').textContent = message;
            onConfirmAction = callback;

            const modal = document.getElementById('confirmModal');
            modal.classList.remove('opacity-0', 'pointer-events-none');
        }

        function closeConfirmModal(result) {
            const modal = document.getElementById('confirmModal');
            modal.classList.add('opacity-0', 'pointer-events-none');
            if (result && typeof onConfirmAction === 'function') {
                onConfirmAction();
            }
            onConfirmAction = null;
        }

        // Merchant Dashboard Functions
        function changeMerchantShop(shopId) {
            merchantShopId = shopId;
            renderMerchantOrders();
        }

        function filterMerchantOrders(status) {
            merchantFilter = status;
            ['All', 'Pending', 'Cooking', 'Ready', 'Completed'].forEach(st => {
                const btn = document.getElementById(`mFilter${st}`);
                if (btn) {
                    if (st.toLowerCase() === status) {
                        btn.className = 'px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 text-white transition-all';
                    } else {
                        btn.className = 'px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all';
                    }
                }
            });
            renderMerchantOrders();
        }

        function renderMerchantOrders() {
            const grid = document.getElementById('merchantOrdersGrid');
            const shopOrders = orders.filter(o => o.shopId === merchantShopId);

            // Update Merchant Stats Counters
            document.getElementById('statPendingCount').textContent = shopOrders.filter(o => o.status === 'pending').length;
            document.getElementById('statCookingCount').textContent = shopOrders.filter(o => o.status === 'cooking').length;
            document.getElementById('statReadyCount').textContent = shopOrders.filter(o => o.status === 'ready').length;
            document.getElementById('statCompletedCount').textContent = shopOrders.filter(o => o.status === 'completed').length;

            // Filter Orders
            let filtered = shopOrders;
            if (merchantFilter === 'pending') filtered = shopOrders.filter(o => o.status === 'pending');
            else if (merchantFilter === 'cooking') filtered = shopOrders.filter(o => o.status === 'cooking');
            else if (merchantFilter === 'ready') filtered = shopOrders.filter(o => o.status === 'ready');
            else if (merchantFilter === 'completed') filtered = shopOrders.filter(o => o.status === 'completed' || o.status === 'cancelled');

            if (filtered.length === 0) {
                grid.innerHTML = `
                <div class="col-span-full bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-2">
                    <i class="fa-solid fa-clipboard-check text-3xl text-slate-300"></i>
                    <h3 class="font-kanit font-bold text-slate-700">ไม่มีรายการคำสั่งซื้อในหมวดหมู่นี้</h3>
                </div>
                `;
                return;
            }

            grid.innerHTML = filtered.map(order => {
                const statusBadge = getStatusBadgeHTML(order.status);
                return `
                <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 space-y-4 flex flex-col justify-between">
                    <div class="space-y-3">
                        <!-- Top Bar -->
                        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <span class="text-xs font-bold text-slate-400">คิวที่</span>
                                <div class="text-2xl font-black font-kanit text-slate-800 leading-none">${order.queueNo}</div>
                            </div>
                            <div class="text-right">
                                ${statusBadge}
                                <div class="text-[10px] text-slate-400 mt-1">${new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</div>
                            </div>
                        </div>

                        <!-- Customer Info -->
                        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                            <div>
                                <span class="font-bold text-slate-800"><i class="fa-solid fa-user text-slate-400 mr-1"></i> ${order.customerName}</span>
                                <span class="text-slate-500 block">${order.customerPhone || 'ไม่ระบุเบอร์โทร'}</span>
                            </div>
                            <span class="px-2 py-1 bg-white rounded-lg border border-slate-200 font-semibold text-slate-700">
                                ${order.pickupType === 'dine-in' ? '🍽️ ทานร้าน' : '🛍️ กลับบ้าน'}
                            </span>
                        </div>

                        <!-- Ordered Items -->
                        <div class="space-y-1 bg-orange-50/50 p-3 rounded-xl border border-orange-100/80 text-xs">
                            <div class="font-semibold text-slate-700 mb-1">รายการที่สั่ง:</div>
                            ${order.items.map(item => `
                                <div class="flex justify-between text-slate-700">
                                    <span>• ${item.name} × <strong>${item.qty}</strong> ${item.note ? `<span class="text-orange-600">(${item.note})</span>` : ''}</span>
                                    <span>฿${item.price * item.qty}</span>
                                </div>
                            `).join('')}

                            ${order.note ? `
                                <div class="text-[11px] text-slate-600 font-medium pt-1 border-t border-orange-200/50 mt-1">
                                    <strong>หมายเหตุ:</strong> ${order.note}
                                </div>
                            ` : ''}

                            <div class="flex justify-between font-bold text-sm text-slate-800 pt-1.5 border-t border-orange-200/60 mt-1">
                                <span>ราคารวม:</span>
                                <span class="text-orange-600">฿${order.totalPrice}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Merchant Action Controls -->
                    <div class="pt-2 border-t border-slate-100 space-y-2">
                        ${order.status === 'pending' ? `
                            <div class="text-xs font-semibold text-slate-700 mb-1">ระบุเวลาทำโดยประมาณ:</div>
                            <div class="grid grid-cols-3 gap-1.5 mb-2">
                                <button onclick="acceptOrderWithTime('${order.id}', 5)" class="py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition-colors">+5 นาที</button>
                                <button onclick="acceptOrderWithTime('${order.id}', 10)" class="py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition-colors">+10 นาที</button>
                                <button onclick="acceptOrderWithTime('${order.id}', 15)" class="py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition-colors">+15 นาที</button>
                            </div>
                            <button onclick="updateOrderStatus('${order.id}', 'cooking')" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-kanit font-bold text-xs rounded-xl shadow-md transition-all">
                                <i class="fa-solid fa-fire mr-1"></i> รับคิว & เริ่มทำอาหาร
                            </button>
                        ` : ''}

                        ${order.status === 'cooking' ? `
                            <button onclick="updateOrderStatus('${order.id}', 'ready')" class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-kanit font-bold text-xs rounded-xl shadow-md transition-all">
                                <i class="fa-solid fa-bell-concierge mr-1"></i> เปลี่ยนเป็น "พร้อมรับอาหาร"
                            </button>
                        ` : ''}

                        ${order.status === 'ready' ? `
                            <button onclick="updateOrderStatus('${order.id}', 'completed')" class="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-kanit font-bold text-xs rounded-xl shadow-md transition-all">
                                <i class="fa-solid fa-circle-check mr-1"></i> ส่งมอบอาหารแล้ว (เสร็จสิ้น)
                            </button>
                        ` : ''}
                    </div>
                </div>
                `;
            }).join('');
        }

        function acceptOrderWithTime(orderId, mins) {
            const idx = orders.findIndex(o => o.id === orderId);
            if (idx !== -1) {
                orders[idx].estMinutes = mins;
                orders[idx].status = 'cooking';
                orders[idx].updatedAt = new Date().toISOString();
                saveOrdersToStorage();
                renderMerchantOrders();
                showToast(`รับออเดอร์ ${orders[idx].queueNo} (เวลาประมาณ ${mins} นาที)`, 'success');
                playSound('success');
            }
        }

        function updateOrderStatus(orderId, newStatus) {
            const idx = orders.findIndex(o => o.id === orderId);
            if (idx !== -1) {
                orders[idx].status = newStatus;
                orders[idx].updatedAt = new Date().toISOString();
                saveOrdersToStorage();
                renderMerchantOrders();
                showToast(`เปลี่ยนสถานะคิว ${orders[idx].queueNo} เรียบร้อยแล้ว`, 'info');
                playSound(newStatus === 'ready' ? 'bell' : 'success');
            }
        }

        // Toast Floating Alerts
        function showToast(message, type = 'info') {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');

            let bgClass = 'bg-slate-800 text-white';
            let iconClass = 'fa-info-circle text-blue-400';

            if (type === 'success') {
                bgClass = 'bg-emerald-800 text-white';
                iconClass = 'fa-circle-check text-emerald-300';
            } else if (type === 'error') {
                bgClass = 'bg-red-800 text-white';
                iconClass = 'fa-triangle-exclamation text-red-300';
            }

            toast.className = `${bgClass} p-3.5 rounded-2xl shadow-xl text-xs font-medium flex items-center gap-2.5 transition-all duration-300 transform translate-x-10 opacity-0 pointer-events-auto border border-white/10`;
            toast.innerHTML = `
                <i class="fa-solid ${iconClass} text-base"></i>
                <span class="flex-1">${message}</span>
            `;

            container.appendChild(toast);

            setTimeout(() => {
                toast.classList.remove('translate-x-10', 'opacity-0');
            }, 50);

            setTimeout(() => {
                toast.classList.add('translate-x-10', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        }
