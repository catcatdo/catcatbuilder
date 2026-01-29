const Footer = () => {
    return (
        <footer className="bg-white border-t mt-12">
            <div className="container mx-auto px-6 py-6 text-center text-gray-600">
                <p>&copy; {new Date().getFullYear()} Smart Hydroponics Guide. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
