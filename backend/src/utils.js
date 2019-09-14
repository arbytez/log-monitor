exports.hasPermission = (user, permissionsNeeded) => {
  if (!user || !user.roles) return false;
  const matchedPermissions = user.roles.filter(permissionTheyHave =>
    permissionsNeeded.includes(permissionTheyHave)
  );
  return matchedPermissions.length;
};

exports.getCookieFromReq = (req, cookieKey) => {
  try {
    const cookie = req.headers.cookie
      .split(';')
      .find(c => c.trim().startsWith(`${cookieKey}=`));
    if (!cookie) {
      return undefined;
    }
    return cookie.split('=')[1];
  } catch (error) {
    return undefined;
  }
};
