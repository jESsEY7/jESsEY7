from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings

class Migration(migrations.Migration):

    dependencies = [
        ('vehicles', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Listing',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('price', models.DecimalField(decimal_places=2, max_digits=12)),
                ('suggested_price', models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ('is_published', models.BooleanField(default=False)),
                ('is_verified', models.BooleanField(default=False)),
                ('verification_notes', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('active', 'Active'), ('sold', 'Sold'), ('archived', 'Archived')], default='pending', max_length=20)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('updated_date', models.DateTimeField(auto_now=True)),
                ('vehicle', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='listing', to='vehicles.vehicle')),
            ],
        ),
        migrations.CreateModel(
            name='Photo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('url', models.URLField()),
                ('is_primary', models.BooleanField(default=False)),
                ('order', models.PositiveIntegerField(default=0)),
                ('metadata', models.JSONField(default=dict, blank=True)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('uploaded_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('vehicle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='photos', to='vehicles.vehicle')),
            ],
            options={'ordering': ['order']},
        ),
        migrations.CreateModel(
            name='ConditionReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('engine_health', models.CharField(blank=True, choices=[('good', 'Good'), ('minor_issues', 'Minor Issues'), ('major_issues', 'Major Issues')], max_length=50)),
                ('bodywork', models.CharField(blank=True, choices=[('excellent', 'Excellent'), ('minor_damage', 'Minor Damage'), ('major_damage', 'Major Damage')], max_length=50)),
                ('tire_tread', models.CharField(blank=True, choices=[('new', 'New'), ('good', 'Good'), ('worn', 'Worn')], max_length=50)),
                ('notes', models.TextField(blank=True)),
                ('completed', models.BooleanField(default=False)),
                ('score', models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('updated_date', models.DateTimeField(auto_now=True)),
                ('reporter', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('vehicle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='condition_reports', to='vehicles.vehicle')),
            ],
        ),
        migrations.CreateModel(
            name='VINLookupRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('vin', models.CharField(max_length=50, unique=True)),
                ('data', models.JSONField(default=dict)),
                ('source', models.CharField(blank=True, max_length=100)),
                ('fetched_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
            ],
        ),
    ]
