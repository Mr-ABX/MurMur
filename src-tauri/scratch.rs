use objc2::runtime::{AnyObject, AnyClass, Sel};
use objc2::sel;
use objc2::ffi::{class_replaceMethod, method_getTypeEncoding, class_getInstanceMethod, IMP};

fn test() {
    let s: Sel = sel!(constrainFrameRect:toScreen:);
    let ptr = std::ptr::null_mut(); // mock AnyClass ptr
    
    // How to pass Sel?
    // Let's try transmuting it
    let sel_ptr: *const objc2::ffi::objc_selector = unsafe { std::mem::transmute(s) };
}
