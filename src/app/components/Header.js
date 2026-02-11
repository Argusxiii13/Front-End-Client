'use client';

import { useContext, useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Bell, ChevronDown, User, Settings, LogOut, Clock } from 'lucide-react';
import { SearchContext } from '../context/search';
import SearchMobile from './SearchMobile';
import PaymentModal from './PaymentModal'
import FeedbackModal from './FeedbackModal';
import BookingHistoryModal from './BookingHistoryModal';

export default function Component() {
    const pathname = usePathname();
    const router = useRouter();
    const { setSearchActive } = useContext(SearchContext);
    const [header, setHeader] = useState(false);
    const [nav, setNav] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [profilePictureUrl, setProfilePictureUrl] = useState('/images/profiles/Default.jpg');
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const mobileNavRef = useRef(null);
    const dropdownRef = useRef(null);
    const notificationDropdownRef = useRef(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false); // State for FeedbackModal
    const [selectedCarId, setSelectedCarId] = useState(null);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [isBookingDetailsModalOpen, setIsBookingDetailsModalOpen] = useState(false);
    const [isBookingHistoryModalOpen, setIsBookingHistoryModalOpen] = useState(false);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phonenumber: '',
        cartype: '',
        address: '',
        allergies: '',
        likes: '',
        gender: '',
        password: ''
      })
    const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
    const [hasFeedback, setHasFeedback] = useState(false);

    const checkLoginStatus = () => {
        const userStr = localStorage.getItem('user');
        const isLoggedInStr = localStorage.getItem('isLoggedIn');

        let userData;
        try {
            userData = JSON.parse(userStr);
        } catch (e) {
            console.error('Error parsing user data:', e);
        }

        const loggedIn = isLoggedInStr === 'true' && userData && userData.id;
        setIsLoggedIn(loggedIn);
        setUser(userData);
    };
    
    const handleFetchNotifications = async () => {
        if (!user?.id) return; // Ensure user ID exists
    
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/messages/user/${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch notifications');
            const data = await response.json();
    
            const mappedNotifications = data.map(notif => ({
                id: notif.m_id, // Existing ID
                title: notif.title,
                message: notif.message,
                read: notif.read,
                createdAt: notif.created_at,
                user_id: notif.user_id, // Ensure this line is present
                booking_id: notif.booking_id // Use the new booking_id from the database
            }));
    
            setNotifications(mappedNotifications);
            setUnreadCount(mappedNotifications.filter(notif => !notif.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchBookingHistory = async () => {
        if (!user?.id) return;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/bookings/user/${user.id}`);
            if (response.ok) {
                const bookingsData = await response.json();
                return bookingsData;
            } else {
                console.error('Failed to fetch booking history:', response.status);
                return [];
            }
        } catch (error) {
            console.error('Error fetching booking history:', error);
            return [];
        }
    };
    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/messages/user/${user.id}`);
            
            if (!response.ok) throw new Error('Failed to fetch notifications');
            const data = await response.json();    
            const mappedNotifications = data.map(notif => ({
                id: notif.m_id, // Map to the component's expected id
                title: notif.title,
                message: notif.message,
                read: notif.read,
                createdAt: notif.created_at, // Use createdAt instead of created_at
                user_id: notif.user_id // Ensure this line is present
            }));

            setNotifications(mappedNotifications);
            setUnreadCount(mappedNotifications.filter(notif => !notif.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = (notificationId) => {
        setNotifications(notifications.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleCancelBooking = async (booking_id, cancelReason) => {
        try {
          // Validate inputs
          if (!booking_id) {
            throw new Error('Booking ID is required');
          }
          
          if (!cancelReason || cancelReason.trim() === '') {
            throw new Error('Cancellation reason cannot be empty');
          }
      
          // Make the API call
          const response = await axios.put(`/api/bookings/cancel/${booking_id}`, {
            cancel_reason: cancelReason
          });
      
          // Check the success status from the server
          if (response.data.success) {
            // Show success message
            toast.success('Booking cancelled successfully');
            
            // Optional: return the updated booking data
            return response.data.booking;
          } else {
            // Handle server-side validation errors
            throw new Error(response.data.message || 'Failed to cancel booking');
          }
        } catch (error) {
          // Handle different types of errors
          if (error.response) {
            // The request was made and the server responded with a status code
            toast.error(error.response.data.message || 'Failed to cancel booking');
          } else if (error.request) {
            // The request was made but no response was received
            toast.error('No response from server');
          } else {
            // Something happened in setting up the request
            toast.error(error.message);
          }
      
          // Rethrow to allow further error handling
          throw error;
        }
      };

    const markNotificationAsRead = async (notificationId) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/messages/${notificationId}/read`, {
                method: 'PATCH'
            });
            markAsRead(notificationId); // Update local state
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        const booking_id = notification.booking_id; // Use the new booking_id directly
        console.log(booking_id);
        if (booking_id) {
            try {
                // Fetch booking details
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/bookings/${booking_id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch booking details');
                }
                const bookingData = await response.json();
                setSelectedBookingDetails(bookingData); // Store the booking details
    
                // Check if feedback already exists for the booking
                const feedbackCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/feedback/check/${booking_id}`);
                if (!feedbackCheckResponse.ok) {
                    throw new Error('Failed to check feedback status');
                }
                const feedbackData = await feedbackCheckResponse.json();
                setHasFeedback(feedbackData.hasFeedback); // Update feedback status
    
            } catch (error) {
                console.error('Error fetching booking details or feedback status:', error);
            }
        }
    
        markNotificationAsRead(notification.id);
        setSelectedNotification({
            ...notification,
            booking_id
        });
        setModalOpen(true);
    };
    
    useEffect(() => {
    }, [hasFeedback]);
    
    const closeModal = () => {
        if (selectedNotification) {
            markNotificationAsRead(selectedNotification.id); // Mark as read when closing
        }
        setModalOpen(false);
        setSelectedNotification(null);
    };

    const fetchUserData = async () => {
        try {
          const userStr = localStorage.getItem('user')
          const user = JSON.parse(userStr)
          if (user && user.id) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/user/${user.id}`)
            if (response.ok) {
              const data = await response.json()
              setUserData(data)
    
              const pictureResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/profilepicture/${user.id}`)
              if (pictureResponse.ok) {
                const blob = await pictureResponse.blob()
                const url = URL.createObjectURL(blob)
                setProfilePictureUrl(url)
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
    useEffect(() => {
        checkLoginStatus();
        fetchUserData();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setHeader(window.scrollY > 40);
            setSearchActive(window.scrollY > 800);

            if (pathname === '/') {
                const sections = ['home', 'why', 'about', 'contactsection'];
                for (const section of sections) {
                    const element = document.getElementById(section);
                    if (element && window.scrollY >= element.offsetTop - 100) {
                        setActiveSection(section);
                    }
                }
            } else {
                setActiveSection(pathname.replace('/', ''));
            }
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [pathname, setSearchActive]);

    useEffect(() => {
        if (nav) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [nav]);

    const handleNavigation = (path) => {
        setNav(false);
        if (pathname === '/' && ['home', 'why', 'about'].includes(path)) {
            const element = document.getElementById(path);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            if (['home', 'why', 'about'].includes(path)) {
                router.push(`/#${path}`);
            } else {
                router.push(`/${path}`);
            }
        }
        setActiveSection(path);
    };

    const navItemClass = (itemName) => 
        `cursor-pointer transition-all duration-300 px-4 py-3 rounded-lg text-base md:text-sm w-full md:w-auto text-center ${
            activeSection === itemName 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-blue-50 text-gray-700'
        }`;

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
        setUser(null);
        setDropdownOpen(false);
        setProfilePictureUrl('/images/profiles/Default.jpg');
        router.push('/');
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && modalOpen) {
                closeModal();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [modalOpen]);


    async function handlePriceConfirmation(notification, user_id) {
        // Check if notification exists
        if (!notification) {
            console.error('Invalid notification format.');
            return; // Exit if notification is invalid
        }
    
        // Get the booking ID directly from the notification
        const booking_id = notification.booking_id; // Use the new booking_id property
    
        if (!booking_id) {
            console.error('Booking ID not found in the notification.');
            return; // Exit if booking ID is not found
        }
    
        // Convert booking_id to an integer
        const id = parseInt(booking_id, 10);
        if (isNaN(id)) {
            console.error('Invalid booking ID:', booking_id);
            return; // Exit if conversion fails
        }
    
        try {
            // Call the API to confirm the price using the extracted booking ID
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/bookings/${id}/confirm-price`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({
                    user_id: user_id,
                    clientEmail: user.email,
                    booking_id: booking_id,
                }),
            });
        } catch (error) {
            console.error('Error confirming price:', error);
        }
    
        // Close the modal after the action
        if (typeof closeModal === 'function') {
            closeModal();
        }
    }

    


    const handleFeedbackClick = async (carId, notification) => {
        // Use the booking_id directly from the notification
        const booking_id = notification.booking_id; // Get the booking ID from the notification
    
        if (!booking_id) {
            console.error('Booking ID not found in the notification.');
            alert("Booking ID is required.");
            return; // Exit if booking ID is not present
        }
    
        setSelectedCarId(carId); // Set the car ID
    
        // Fetch booking details using the booking ID
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/booking/data-retrieve/${booking_id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch booking details');
            }
            const bookingData = await response.json();
    
            // Set the booking details and ID
            setBookingDetails(bookingData); // Store the entire booking data
            setSelectedBookingId(bookingData.booking_id); 
            setFeedbackModalOpen(true); // Open the FeedbackModal
        } catch (error) {
            console.error('Error fetching booking details:', error);
            alert("There was an error fetching booking details: " + error.message);
        }
    };

    const BookingDetailsModal = ({ isOpen, onClose, bookingData }) => {
        if (!isOpen || !bookingData) return null;
    
        const formatPrice = (price) => {
            return price === 0 || price === '0.00' ? 'Pending' : `$${price.toFixed(2)}`;
        };
    
        const formatRentalType = (type) => {
            return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        };
    
        const formatTime = (time) => {
            if (!time) return ''; // Handle empty time
            const [hours, minutes] = time.split(':');
            const hours12 = (hours % 12) || 12; // Convert to 12-hour format
            const ampm = hours < 12 ? 'AM' : 'PM'; // Determine AM/PM
            return `${hours12}:${minutes} ${ampm}`;
        };

        String(bookingData.booking_id).padStart(11, '0')
    
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
                    <h2 className="text-lg font-semibold">Booking Details</h2>
                    <p className="mt-2">Booking ID: {String(bookingData.booking_id).padStart(11, '0')}</p>
                    <p className="mt-2">Car ID: {String(bookingData.car_id).padStart(11, '0')}</p>
                    <p className="mt-2">Name: {bookingData.name}</p>
                    <p className="mt-2">Email: {bookingData.email}</p>
                    <p className="mt-2">Phone: {bookingData.phone}</p>
                    <p className="mt-2">Pickup Location: {bookingData.pickup_location}</p>
                    <p className="mt-2">Return Location: {bookingData.return_location}</p>
                    <p className="mt-2">Pickup Date: {new Date(bookingData.pickup_date).toLocaleDateString()}</p>
                    <p className="mt-2">Return Date: {new Date(bookingData.return_date).toLocaleDateString()}</p>
                    <p className="mt-2">Pickup Time: {formatTime(bookingData.pickup_time)}</p>
                    <p className="mt-2">Return Time: {formatTime(bookingData.return_time)}</p>
                    <p className="mt-2">Rental Type: {formatRentalType(bookingData.rental_type)}</p>
                    <p className="mt-2">Status: {bookingData.status}</p>
                    <p className="mt-2">Price: {formatPrice(bookingData.price)}</p>
                    <p className="mt-2">Additional Requests: {bookingData.additionalrequest}</p>
                    <p className="mt-2">Created At: {new Date(bookingData.created_at).toLocaleString()}</p>
    
                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={onClose} 
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Close
                        </button>
                        <Link href="/profile" className="ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                            More Bookings
                        </Link>
                    </div>
                </div>
            </div>
        );
    };
      // Function to handle the button click to view booking
      const handleViewBookingClick = async () => {
        // Use the booking_id directly from the selectedNotification
        const booking_id = selectedNotification.booking_id; // Get the booking ID directly
    
        if (booking_id) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/booking/data-retrieve/${booking_id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch booking details');
                }
                const bookingData = await response.json();
                setBookingDetails(bookingData); // Set the fetched booking data
                setIsBookingDetailsModalOpen(true); // Open the booking details modal
            } catch (error) {
                console.error('Error fetching booking details:', error);
                alert("There was an error fetching booking details: " + error.message);
            }
        } else {
            console.error('Booking ID is not available in the selected notification.');
            alert("Booking ID is required to view booking details.");
        }
    };

    return (
        <header 
            className={`${
                header ? 'bg-white shadow-md py-2' : 'bg-white md:bg-transparent shadow-none py-2 md:py-4'
            } fixed w-full max-w-[1920px] mx-auto z-50 transition-all duration-300`}
        >
            <div className='container mx-auto px-4'>
                <div className='flex items-center justify-between h-16'>
                    {/* Logo */}
                    <Link href="/" className='relative z-50'>
                        <Image 
                            src={'/icons/AutoConnect Logo.svg'} 
                            width={250} 
                            height={80} 
                            alt='AutoConnect' 
                            className='w-auto h-16 md:h-20'
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className='hidden md:flex items-center space-x-2'>
                        <button onClick={() => handleNavigation('home')} className={navItemClass('home')}>Home</button>
                        <button onClick={() => handleNavigation('why')} className={navItemClass('why')}>Why us</button>
                        <button onClick={() => handleNavigation('about')} className={navItemClass('about')}>About</button>
                        <button onClick={() => handleNavigation('browsecars')} className={navItemClass('browsecars')}>Browse Cars</button>
                        <button onClick={() => handleNavigation('contact')} className={navItemClass('contact')}>Contact</button>
                    </nav>

                    {/* Desktop Auth/Profile Section */}
                    <div className='hidden md:flex items-center space-x-4'>
                        {isLoggedIn ? (
                            <>
                                {/* Notification Bell */}
                                <div className="relative" ref={notificationDropdownRef}>
                                    <button 
                                        onClick={() => {
                                            setNotificationDropdownOpen(!notificationDropdownOpen);
                                            if (!notificationDropdownOpen) handleFetchNotifications(); // Fetch notifications when opening
                                        }}
                                        className="relative p-2 text-gray-600 hover:text-blue-500 transition-colors duration-300"
                                    >
                                        <Bell className="w-6 h-6" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Notification Dropdown */}
                                    {notificationDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden">
                                            <div className="p-4 border-b">
                                                <h3 className="text-lg font-semibold">Notifications</h3>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    notifications.map((notification) => (
                                                        <div
                                                            key={notification.id}
                                                            className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                                                                !notification.read ? 'bg-blue-50' : ''
                                                            }`}
                                                            onClick={() => handleNotificationClick(notification)}
                                                        >
                                                            <p className="font-medium text-gray-900">{notification.title}</p>
                                                            <p className="text-sm text-gray-600">{notification.message}</p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {new Date(notification.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-center text-gray-500">
                                                        No notifications
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500">
                        <Image 
                            src={profilePictureUrl}
                            alt="Profile" 
                            width={40} 
                            height={40}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden">
        <Link href="/profile" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
            <User className="w-4 h-4 mr-2" />
            Profile Details
        </Link>
        <button 
            onClick={() => {
                setIsBookingHistoryModalOpen(true);
                setDropdownOpen(false);
            }}
            className="flex items-center w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
        >
            <Clock className="w-4 h-4 mr-2" />
            Booking History
        </button>
        <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-left text-red-600 hover:bg-gray-50"
        >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
        </button>
    </div>
)}
            </div>
                            </>
                        ) : (
                            <Link 
                                href="/signin"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setNav(!nav)}
                        className="relative z-50 p-2 -mr-2 md:hidden focus:outline-none"
                    >
                        {nav ? (
                            <X className="w-6 h-6 text-gray-900" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-900" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation Menu */}
                <div
                    ref={mobileNavRef}
                    className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out ${
                        nav ? 'translate-x-0' : 'translate-x-full'
                    } md:hidden`}
                >
                    <div className="flex flex-col h-full pt-20 pb-6 px-4 overflow-y-auto">
                        <nav className="flex flex-col space-y-3">
                            <button onClick={() => handleNavigation('home')} className={navItemClass('home')}>
                                Home
                            </button>
                            <button onClick={() => handleNavigation('why')} className={navItemClass('why')}>
                                Why us
                            </button>
                            <button onClick={() => handleNavigation('about')} className={navItemClass('about')}>
                                About
                            </button>
                            <button onClick={() => handleNavigation('browsecars')} className={navItemClass('browsecars')}>
                                Browse Cars
                            </button>
                            <button onClick={() => handleNavigation('contact')} className={navItemClass('contact')}>
                                Contact
                            </button>
                        </nav>

                        <div className="mt-6">
                            <SearchMobile />
                            
                            {isLoggedIn ? (
                                <div className="border-t border-gray-200 mt-4 pt-4">
                                    {/* Notification Bell for mobile */}
                                    <button 
                                        onClick={() => {
                                            setNotificationDropdownOpen(!notificationDropdownOpen);
                                            if (!notificationDropdownOpen) handleFetchNotifications();
                                        }}
                                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 space-x-3"
                                    >
                                        <Bell className="w-5 h-5" />
                                        <span className="flex-grow">Notifications</span>
                                        {unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Notification Dropdown for mobile */}
                                    {notificationDropdownOpen && (
                                        <div className="px-4 py-2 bg-gray-50 mt-2 rounded-lg">
                                            {notifications.length > 0 ? (
                                                notifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`p-3 border-b last:border-b-0 ${
                                                            !notification.read ? 'bg-blue-50' : ''
                                                        }`}
                                                        onClick={() => handleNotificationClick(notification)}
                                                    >
                                                        <p className="font-medium text-gray-900">{notification.title}</p>
                                                        <p className="text-sm text-gray-600">{notification.message}</p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {new Date(notification.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-gray-500 py-2">
                                                    No notifications
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-3 px-4 py-4 mt-3 bg-gray-50 rounded-lg">
                                        <Image 
                                            src={profilePictureUrl}
                                            alt="Profile" 
                                            width={40} 
                                            height={40}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                        </div>
                                    </div>
                                    <button 
                                    onClick={() => {
                                        setIsBookingHistoryModalOpen(true);
                                        setNav(false); // Close mobile menu
                                    }}
                                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    <Clock className="w-5 h-5 mr-3" />
                                    Booking History
                                </button>

                                    <div className="mt-3 space-y-2">
                                        <Link href="/profile" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                                            <User className="w-5 h-5 mr-3" />
                                            Profile Details
                                        </Link>
                                        <button 
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-3 text-left text-red-600 hover:bg-gray-50 rounded-lg"
                                        >
                                            <LogOut className="w-5 h-5 mr-3" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-t border-gray-200 mt-4 pt-4 px-4">
                                    <Link 
                                        href="/signin"
                                        className="flex items-center justify-center w-full px-4 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

{/* Notification Modal */}
{modalOpen && selectedNotification && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-lg font-semibold">{selectedNotification.title}</h2>
            <p className="mt-2 text-gray-700">{selectedNotification.message}</p>
            <p className="mt-2 text-xs text-gray-400">
              {new Date(selectedNotification.createdAt).toLocaleString()}
            </p>
            <div className="mt-4 flex justify-end">
              {/* Close button */}
              <button 
                onClick={closeModal} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>

{/* Price Notification button - only show if priceaccepted is false */}
{selectedNotification.title === 'Price Notification.' && selectedBookingDetails && (
    selectedBookingDetails.priceaccepted === false ? (
        <button
            onClick={() => handlePriceConfirmation(selectedNotification, user.id)}
            className="ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
            Confirm Price
        </button>
    ) : (
        <button
            disabled
            className="ml-2 px-4 py-2 bg-green-500 text-white rounded opacity-50 cursor-not-allowed"
        >
            Price already confirmed
        </button>
    )
)}

{/* Payment Method button - only show if receipt is null */}
{selectedNotification.title === 'Payment Method.' && selectedBookingDetails && (
    selectedBookingDetails.receipt === null ? (
        <button
            onClick={() => setPaymentModalOpen(true)}
            className="ml-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
            View Payment Details
        </button>
    ) : (
        <button
            disabled
            className="ml-2 px-4 py-2 bg-yellow-500 text-white rounded opacity-50 cursor-not-allowed"
        >
            Payment already submitted
        </button>
    )
)}

              {/* For Bookings Made Modal */}
              {selectedNotification.title === 'Booking Created.' && (
    <button
        onClick={handleViewBookingClick}
        className="ml-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-yellow-600"
    >
        View Booking Made
    </button>
)}


{/* Feedback button for Booking Finished */}
{selectedNotification.title === 'Booking Finished.' && (
    hasFeedback ? (
        <button
            disabled
            className="ml-2 px-4 py-2 bg-purple-500 text-white rounded opacity-50 cursor-not-allowed"
        >
            Feedback already submitted
        </button>
    ) : (
        <button
            onClick={() => handleFeedbackClick(selectedCarId, selectedNotification)}
            className="ml-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
            Feedback
        </button>
    )
)}
            </div>
          </div>
        </div>
      )}
{/* Payment Modal */}
<PaymentModal
    isOpen={paymentModalOpen}
    onClose={() => setPaymentModalOpen(false)}
    booking_id={selectedNotification?.booking_id}
    user_id={selectedNotification?.user_id} // This should now have a value if the above steps are correct
/>
{/* Feedback Modal */}
<FeedbackModal 
    isOpen={feedbackModalOpen} 
    onClose={() => {
        setFeedbackModalOpen(false);
        closeModal(true);
      }}
    user_id={user?.id} 
    booking_id={selectedBookingId} // Pass the booking ID
    bookingDetails={bookingDetails} // Pass the booking details
/>
{/* Booking Details Modal */}
<BookingDetailsModal 
    isOpen={isBookingDetailsModalOpen} 
    onClose={() => setIsBookingDetailsModalOpen(false)} 
    bookingData={bookingDetails} 
/>
 {/* Booking History Modal */}
 <BookingHistoryModal
                isOpen={isBookingHistoryModalOpen}
                onClose={() => setIsBookingHistoryModalOpen(false)}
                fetchBookingHistory={fetchBookingHistory}
                onCancelBooking={handleCancelBooking}
            />

            </div>
        </header>
    );
}