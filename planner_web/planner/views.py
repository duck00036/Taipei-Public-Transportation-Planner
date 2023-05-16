from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from .forms import RegistrationForm, LoginForm
from planner.models import PathJsonData
from django.contrib.auth.models import User
from django.core import serializers
from django.shortcuts import get_object_or_404
import requests, json, os

def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = RegistrationForm()

    context = {'form': form}
    return render(request, 'planner/register.html', context)

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(data=request.POST)
        if form.is_valid():
            user = authenticate(
                username=form.cleaned_data.get('username'),
                password=form.cleaned_data.get('password')
            )
            if user is not None:
                login(request, user)
                return redirect('home')
    else:
        form = LoginForm()

    context = {'form': form}
    return render(request, 'planner/login.html', context)

def logout_view(request):
    logout(request)
    return redirect('home')

def home_view(request):
    api_key = os.environ.get('API_KEY')
    return render(request, 'planner/home.html', {'api_key': api_key})

def mypath_view(request):
    api_key = os.environ.get('API_KEY')
    return render(request, 'planner/mypath.html', {'api_key': api_key})


def get_paths(request):
    paths = list(PathJsonData.objects.filter(user_id=request.user.id).values('id', 'user_id', 'path_data', 'path_type', 'path_name', 'path_tag', 'date', 'start_lat', 'start_lon', 'end_lat', 'end_lon'))
    data = {
        'paths': paths
    }
    return JsonResponse(paths, safe=False)

def delete_path(request, path_id):
    print(path_id)
    path = get_object_or_404(PathJsonData, id=path_id)
    path.delete()
    return JsonResponse({'success': True})

def calculate_view(request):
    if request.method == 'POST':
        print(request.POST)
        start_lat = round(float(request.POST.get('start_lat', '')),6)
        start_lon = round(float(request.POST.get('start_lon', '')),6)
        end_lat = round(float(request.POST.get('end_lat', '')),6)
        end_lon = round(float(request.POST.get('end_lon', '')),6)
        day = int(request.POST.get('day', ''))
        hour = int(request.POST.get('hour', ''))
        minute = int(request.POST.get('minute', ''))
        if hour < 3:
            day-=1
            hour+=24
        if day == -1:
            day = 6
        
        if day == 6:
            weekday_type = 'saturday'
        elif day == 0:
            weekday_type = 'sunday'
        else:
            weekday_type = 'weekday'
        
        find_path_api = os.environ.get('FIND_PATH_API')
        response = requests.get(f"{find_path_api}/find?start_lat={start_lat}&start_lon={start_lon}&end_lat={end_lat}&end_lon={end_lon}&hour={hour}&minute={minute}&weektype={weekday_type}")
        print(type(response))
        data = response.json()
        print(type(data))
        return JsonResponse(data)

def save_path(request):
    if request.method == 'POST':
        path_data = json.loads(request.POST.get('path_data', ''))
        path_type = request.POST.get('path_type', '')
        date = request.POST.get('date', '')
        path_name = request.POST.get('path_name', '')
        path_tag = request.POST.get('path_tag', '')
        start_lat = request.POST.get('start_lat', '')
        start_lon = request.POST.get('start_lon', '')
        end_lat = request.POST.get('end_lat', '')
        end_lon = request.POST.get('end_lon', '')

        user_id = request.user.id
        user = User.objects.get(id=user_id)

        try:
            data_to_save = PathJsonData(user_id=user, path_data=path_data, path_type=path_type, path_name=path_name, path_tag=path_tag, date=date, start_lat=start_lat, start_lon=start_lon, end_lat=end_lat, end_lon=end_lon)
            data_to_save.save()
            return HttpResponse('Saved successfully!')
        except:
            return HttpResponse('Saved failed!')
